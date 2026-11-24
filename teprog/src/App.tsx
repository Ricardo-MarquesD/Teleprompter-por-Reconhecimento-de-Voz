import { useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { RetrancasSidebar } from "./components/RetrancasSidebar";
import { OperatorPanel } from "./components/OperatorPanel";
import { OnAirPanel } from "./components/OnAirPanel";
import { LayoutPopup } from "./components/menu/LayoutPopup";
import { MicPopup } from "./components/menu/MicPopup";
import { useAppStore } from "./hooks/useAppStore";
import { useTeprogBootstrap } from "./hooks/useTeprogBootstrap";
import {
  openOnAirWindow,
  openOperatorWindow,
} from "./services/detatchedWindows";
import {
  broadcastOperatorScroll,
  broadcastState,
  onOperatorScroll,
} from "./services/windowSync";
import { patchAppState, getAppState } from "./store/appStore";
import type { LineScrollEngine } from "./teleprompter/lineScrollEngine";

function MainApp() {
  const state = useAppStore();
  const api = useTeprogBootstrap();
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [micOpen, setMicOpen] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void onOperatorScroll((payload) => {
      if (!getAppState().operatorMode) return;
      patchAppState({
        operatorScrollTop: payload.scrollTop,
        currentLineId: payload.lineId,
      });
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten?.();
  }, []);

  const detachOperator = useCallback(async () => {
    patchAppState({ operatorDetached: true });
    const win = await openOperatorWindow();
    void win.onCloseRequested(async () => {
      patchAppState({ operatorDetached: false });
      void broadcastState(getAppState());
    });
    void broadcastState(getAppState());
  }, []);

  const detachOnAir = useCallback(async () => {
    patchAppState({ onAirDetached: true });
    const win = await openOnAirWindow();
    void win.onCloseRequested(async () => {
      patchAppState({ onAirDetached: false });
      void broadcastState(getAppState());
    });
    void broadcastState(getAppState());
  }, []);

  const handleOperatorScroll = useCallback(
    (payload: { scrollTop: number; lineId: string | null }) => {
      api.onOperatorScroll(payload);
      if (getAppState().operatorMode) {
        void broadcastOperatorScroll(payload);
      }
    },
    [api],
  );

  const setOperatorEngine = useCallback((engine: LineScrollEngine | null) => {
    api.operatorEngineRef.current = engine;
  }, [api]);

  const setOnAirEngine = useCallback((engine: LineScrollEngine | null) => {
    api.onAirEngineRef.current = engine;
  }, [api]);

  return (
    <div className="flex h-full flex-col bg-bg_dark text-d_font">
      <Header
        programName={state.script?.meta.program_name ?? null}
        servicesReady={state.servicesReady}
        captureStatus={state.captureStatus}
        operatorMode={state.operatorMode}
        statusMessage={state.statusMessage}
        onImport={() => void api.importScript()}
        onOpenMic={() => setMicOpen(true)}
        onOpenLayout={() => setLayoutOpen(true)}
        onToggleCapture={api.toggleCapture}
        onToggleOperatorMode={api.toggleOperatorMode}
      />

      <div className="flex min-h-0 flex-1">
        <RetrancasSidebar
          laudas={state.script?.laudas ?? []}
          programName={state.script?.meta.program_name ?? null}
          selectedId={state.activeLaudaId}
          onSelect={api.jumpToLauda}
          onSelectStart={api.jumpToStart}
        />
        <OperatorPanel
          script={state.script}
          style={state.style}
          currentLineId={state.currentLineId}
          currentWordId={state.currentWordId}
          spokenWordIds={state.spokenWordIds}
          operatorMode={state.operatorMode}
          detached={state.operatorDetached}
          onDetach={() => void detachOperator()}
          onScrollSync={handleOperatorScroll}
          onEngineReady={setOperatorEngine}
        />
        <OnAirPanel
          script={state.script}
          style={state.style}
          currentLineId={state.currentLineId}
          currentWordId={state.currentWordId}
          spokenWordIds={state.spokenWordIds}
          operatorMode={state.operatorMode}
          operatorScrollTop={state.operatorScrollTop}
          captureStatus={state.captureStatus}
          detached={state.onAirDetached}
          onDetach={() => void detachOnAir()}
          onEngineReady={setOnAirEngine}
        />
      </div>

      {layoutOpen ? (
        <LayoutPopup
          style={state.style}
          onClose={() => setLayoutOpen(false)}
          onSave={(style) => {
            void api.saveStyle(style);
            setLayoutOpen(false);
          }}
        />
      ) : null}

      {micOpen && state.tpBoot ? (
        <MicPopup boot={state.tpBoot} onClose={() => setMicOpen(false)} />
      ) : null}
    </div>
  );
}

function OperatorWindowApp() {
  const state = useAppStore();

  useEffect(() => {
    let unlistenState: (() => void) | undefined;
    let unlistenScroll: (() => void) | undefined;

    void import("./services/windowSync").then(async (sync) => {
      await sync.requestState();
      unlistenState = await sync.onState((payload) => {
        patchAppState({ ...payload });
      });
      unlistenScroll = await sync.onOperatorScroll((payload) => {
        patchAppState({
          operatorScrollTop: payload.scrollTop,
          currentLineId: payload.lineId,
        });
      });
    });

    return () => {
      unlistenState?.();
      unlistenScroll?.();
    };
  }, []);

  const handleScroll = (payload: { scrollTop: number; lineId: string | null }) => {
    patchAppState({
      operatorScrollTop: payload.scrollTop,
      currentLineId: payload.lineId,
    });
    void broadcastOperatorScroll(payload);
  };

  return (
    <div className="h-full bg-bg_dark text-d_font">
      <OperatorPanel
        script={state.script}
        style={state.style}
        currentLineId={state.currentLineId}
        currentWordId={state.currentWordId}
        spokenWordIds={state.spokenWordIds}
        operatorMode={state.operatorMode}
        detached={false}
        onDetach={() => undefined}
        onScrollSync={handleScroll}
      />
    </div>
  );
}

function OnAirWindowApp() {
  const state = useAppStore();

  useEffect(() => {
    let unlistenState: (() => void) | undefined;
    let unlistenScroll: (() => void) | undefined;

    void import("./services/windowSync").then(async (sync) => {
      await sync.requestState();
      unlistenState = await sync.onState((payload) => {
        patchAppState({ ...payload });
      });
      unlistenScroll = await sync.onOperatorScroll((payload) => {
        patchAppState({
          operatorScrollTop: payload.scrollTop,
          currentLineId: payload.lineId,
        });
      });
    });

    return () => {
      unlistenState?.();
      unlistenScroll?.();
    };
  }, []);

  return (
    <div className="h-full bg-black text-d_font">
      <OnAirPanel
        script={state.script}
        style={state.style}
        currentLineId={state.currentLineId}
        currentWordId={state.currentWordId}
        spokenWordIds={state.spokenWordIds}
        operatorMode={state.operatorMode}
        operatorScrollTop={state.operatorScrollTop}
        captureStatus={state.captureStatus}
        detached={false}
        fillWindow
        onDetach={() => undefined}
      />
    </div>
  );
}

export default function App() {
  const hash = window.location.hash.replace(/^#\/?/, "");

  if (hash === "operator") return <OperatorWindowApp />;
  if (hash === "onair") return <OnAirWindowApp />;
  return <MainApp />;
}
