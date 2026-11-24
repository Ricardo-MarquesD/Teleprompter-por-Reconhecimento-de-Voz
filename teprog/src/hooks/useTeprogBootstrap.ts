import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  startSlugProcess,
  startTpProcess,
  stopAllProcesses,
} from "../services/processManager";
import { slugHealth, importScriptFile } from "../services/slugApi";
import { tpHealth } from "../services/tpApi";
import { loadStyleConfig, saveStyleConfig } from "../services/styleConfig";
import { loadSlugScript } from "../services/scriptStore";
import { pickScriptFile } from "../services/pickScriptFile";
import { TpWebSocket } from "../services/tpWebSocket";
import {
  getAppState,
  patchAppState,
  resetFollowProgress,
  setSpokenUpTo,
} from "../store/appStore";
import { activeLaudaForLine } from "../teleprompter/laudaFromLine";
import type { StyleConfig } from "../types/style";
import type { Lauda } from "../types/script";
import {
  broadcastState,
  onRequestState,
  toSyncPayload,
} from "../services/windowSync";
import type { LineScrollEngine } from "../teleprompter/lineScrollEngine";

const sharedWs = new TpWebSocket();
let bootPromise: Promise<void> | null = null;
let closeHooked = false;

async function ensureServices(): Promise<void> {
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    patchAppState({ statusMessage: "Carregando estilo…" });
    const style = await loadStyleConfig();
    patchAppState({ style });

    const script = await loadSlugScript();
    patchAppState({
      script,
      statusMessage: script
        ? `Roteiro: ${script.meta.program_name}`
        : "Sem roteiro carregado",
    });

    patchAppState({ statusMessage: "Iniciando slug_process…" });
    const slugBoot = await startSlugProcess();
    await slugHealth(slugBoot);
    patchAppState({ slugBoot });

    patchAppState({ statusMessage: "Iniciando tp_process…" });
    const tpBoot = await startTpProcess();
    await tpHealth(tpBoot);
    patchAppState({
      tpBoot,
      servicesReady: true,
      statusMessage: "Serviços prontos",
    });

    sharedWs.connect(tpBoot, {
      onMessage: (msg) => {
        if (msg.type === "status") {
          patchAppState({ trackingState: msg.state });
          return;
        }
        if (msg.type === "error") {
          patchAppState({
            captureError: msg.detail,
            statusMessage: msg.detail,
          });
          return;
        }
        if (msg.type === "position") {
          const state = getAppState();
          setSpokenUpTo(msg.word_id);
          const activeLaudaId = activeLaudaForLine(
            state.script?.laudas ?? [],
            state.script?.visual_lines ?? [],
            msg.line_id,
          );
          patchAppState({
            currentLineId: msg.line_id,
            activeLaudaId,
          });
          void broadcastState(getAppState());
        }
      },
      onClose: () => {
        patchAppState({
          captureStatus: "idle",
          statusMessage: "WebSocket desconectado",
        });
      },
    });

    void broadcastState(getAppState());
  })().catch((error) => {
    bootPromise = null;
    patchAppState({
      servicesReady: false,
      captureError: error instanceof Error ? error.message : String(error),
      statusMessage:
        error instanceof Error ? error.message : "Falha ao iniciar serviços",
    });
    throw error;
  });

  return bootPromise;
}

export function useTeprogBootstrap() {
  const wsRef = useRef(sharedWs);
  const operatorEngineRef = useRef<LineScrollEngine | null>(null);
  const onAirEngineRef = useRef<LineScrollEngine | null>(null);

  useEffect(() => {
    void ensureServices();

    let unlistenRequest: (() => void) | undefined;
    void onRequestState(() => {
      void broadcastState(getAppState());
    }).then((fn) => {
      unlistenRequest = fn;
    });

    if (!closeHooked) {
      closeHooked = true;
      void getCurrentWindow().onCloseRequested(async () => {
        sharedWs.close();
        await stopAllProcesses();
      });
    }

    return () => {
      unlistenRequest?.();
    };
  }, []);

  const importScript = async () => {
    const boot = getAppState().slugBoot;
    if (!boot) return;

    const picked = await pickScriptFile();
    if (!picked) return;

    patchAppState({ statusMessage: "Importando roteiro…" });
    await importScriptFile(boot, picked.name, picked.name, picked.bytes);
    const script = await loadSlugScript();
    resetFollowProgress();
    patchAppState({
      script,
      activeLaudaId: null,
      statusMessage: script
        ? `Roteiro: ${script.meta.program_name}`
        : "Importação concluída",
    });
    void broadcastState(getAppState());
  };

  const saveStyle = async (style: StyleConfig) => {
    await saveStyleConfig(style);
    patchAppState({ style });
    void broadcastState(getAppState());
  };

  const jumpToLauda = (lauda: Lauda) => {
    const lineId = lauda.first_line_id;
    if (!lineId) return;
    patchAppState({
      activeLaudaId: lauda.id,
      currentLineId: lineId,
    });
    operatorEngineRef.current?.setTargetLine(lineId, { instant: true });
    onAirEngineRef.current?.setTargetLine(lineId, { instant: true });

    const ws = wsRef.current;
    if (ws.connected && getAppState().captureStatus === "listening") {
      ws.send({
        type: "position",
        line_id: lineId,
        page: lauda.id,
        is_page_jump: true,
      });
    }
    void broadcastState(getAppState());
  };

  const jumpToStart = () => {
    const first = getAppState().script?.visual_lines[0]?.id ?? null;
    patchAppState({ activeLaudaId: null, currentLineId: first });
    if (first) {
      operatorEngineRef.current?.setTargetLine(first, { instant: true });
      onAirEngineRef.current?.setTargetLine(first, { instant: true });
      if (
        wsRef.current.connected &&
        getAppState().captureStatus === "listening"
      ) {
        wsRef.current.send({
          type: "position",
          line_id: first,
          is_page_jump: true,
        });
      }
    }
    void broadcastState(getAppState());
  };

  const toggleCapture = () => {
    const state = getAppState();
    const ws = wsRef.current;
    if (!ws.connected) {
      patchAppState({ statusMessage: "WebSocket indisponível" });
      return;
    }

    if (
      state.captureStatus === "listening" ||
      state.captureStatus === "starting"
    ) {
      ws.send({ type: "operational", state: false });
      patchAppState({
        captureStatus: "idle",
        statusMessage: "Captura parada",
      });
      void broadcastState(getAppState());
      return;
    }

    patchAppState({ captureStatus: "starting", captureError: null });
    try {
      ws.send({
        type: "operational",
        state: true,
        line_id: state.currentLineId,
      });
      patchAppState({
        captureStatus: "listening",
        statusMessage: "Captura ativa",
      });
      void broadcastState(getAppState());
    } catch (error) {
      patchAppState({
        captureStatus: "error",
        captureError: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const toggleOperatorMode = () => {
    patchAppState({ operatorMode: !getAppState().operatorMode });
    void broadcastState(getAppState());
  };

  const onOperatorScroll = (payload: {
    scrollTop: number;
    lineId: string | null;
  }) => {
    const state = getAppState();
    if (!state.operatorMode) return;
    const activeLaudaId = activeLaudaForLine(
      state.script?.laudas ?? [],
      state.script?.visual_lines ?? [],
      payload.lineId,
    );
    patchAppState({
      operatorScrollTop: payload.scrollTop,
      currentLineId: payload.lineId,
      activeLaudaId,
    });
  };

  return {
    importScript,
    saveStyle,
    jumpToLauda,
    jumpToStart,
    toggleCapture,
    toggleOperatorMode,
    onOperatorScroll,
    operatorEngineRef,
    onAirEngineRef,
    wsRef,
    syncPayload: () => toSyncPayload(getAppState()),
  };
}
