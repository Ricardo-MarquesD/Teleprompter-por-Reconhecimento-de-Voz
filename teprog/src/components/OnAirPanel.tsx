import { ASPECT_RATIO_VALUE } from "../types/style";
import type { StyleConfig } from "../types/style";
import type { SlugScript } from "../types/script";
import { TeleprompterPanel } from "./TeleprompterPanel";
import type { LineScrollEngine } from "../teleprompter/lineScrollEngine";

type OnAirPanelProps = {
  script: SlugScript | null;
  style: StyleConfig;
  currentLineId: string | null;
  currentWordId: number | null;
  spokenWordIds: number[];
  operatorMode: boolean;
  operatorScrollTop: number;
  captureStatus: string;
  detached: boolean;
  fillWindow?: boolean;
  onDetach: () => void;
  onEngineReady?: (engine: LineScrollEngine | null) => void;
};

export function OnAirPanel({
  script,
  style,
  currentLineId,
  currentWordId,
  spokenWordIds,
  operatorMode,
  operatorScrollTop,
  captureStatus,
  detached,
  fillWindow = false,
  onDetach,
  onEngineReady,
}: OnAirPanelProps) {
  const ratio = ASPECT_RATIO_VALUE[style.aspectRatio];
  const waiting = captureStatus === "idle";

  if (detached && !fillWindow) {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-current/15 px-3 py-2">
          <div>
            <h2 className="text-sf font-semibold">Ao ar</h2>
            <p className="text-xs opacity-70">Janela destacada</p>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center bg-black text-sf opacity-60">
          Saída aberta em janela solta
        </div>
      </section>
    );
  }

  const frame = (
    <div
      className="relative h-full w-full overflow-hidden bg-panel shadow-2xl"
      style={
        fillWindow
          ? undefined
          : {
              aspectRatio: `${ratio}`,
              maxHeight: "100%",
              maxWidth: "100%",
              width: "auto",
              height: "100%",
            }
      }
    >
      <TeleprompterPanel
        script={script}
        style={style}
        currentLineId={currentLineId}
        currentWordId={currentWordId}
        spokenWordIds={spokenWordIds}
        hideScrollbar
        followVoice={!operatorMode}
        mirrorScrollTop={operatorMode ? operatorScrollTop : null}
        onEngineReady={onEngineReady}
      />
    </div>
  );

  if (fillWindow) {
    return <div className="h-full w-full bg-black p-0">{frame}</div>;
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-current/15 px-3 py-2">
        <div>
          <h2 className="text-sf font-semibold">Ao ar</h2>
          <p className="text-xs opacity-70">
            {waiting ? "Aguardando captura" : `Proporção ${style.aspectRatio}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-current/25 px-2 py-1 text-xs hover:bg-white/10"
            onClick={onDetach}
          >
            Destacar janela
          </button>
          <span className="rounded-md border border-current/25 px-2 py-1 text-xs opacity-80">
            Tela {style.aspectRatio}
          </span>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center bg-black p-3">
        {frame}
      </div>
    </section>
  );
}
