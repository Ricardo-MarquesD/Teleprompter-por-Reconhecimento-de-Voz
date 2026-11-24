import { TeleprompterPanel } from "./TeleprompterPanel";
import type { SlugScript } from "../types/script";
import type { StyleConfig } from "../types/style";
import type { LineScrollEngine } from "../teleprompter/lineScrollEngine";

type OperatorPanelProps = {
  script: SlugScript | null;
  style: StyleConfig;
  currentLineId: string | null;
  currentWordId: number | null;
  spokenWordIds: number[];
  operatorMode: boolean;
  detached: boolean;
  onDetach: () => void;
  onScrollSync?: (payload: { scrollTop: number; lineId: string | null }) => void;
  onEngineReady?: (engine: LineScrollEngine | null) => void;
};

export function OperatorPanel({
  script,
  style,
  currentLineId,
  currentWordId,
  spokenWordIds,
  operatorMode,
  detached,
  onDetach,
  onScrollSync,
  onEngineReady,
}: OperatorPanelProps) {
  if (detached) {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col border-r border-current/15">
        <header className="flex items-center justify-between border-b border-current/15 px-3 py-2">
          <h2 className="text-sf font-semibold">Operador</h2>
          <span className="text-xs opacity-70">Janela destacada</span>
        </header>
        <div className="flex flex-1 items-center justify-center text-sf opacity-60">
          Painel aberto em janela solta
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col border-r border-current/15">
      <header className="flex items-center justify-between border-b border-current/15 px-3 py-2">
        <h2 className="text-sf font-semibold">Operador</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">
            {operatorMode ? "Scroll livre" : "Segue voz"}
          </span>
          <button
            type="button"
            className="rounded-md border border-current/25 px-2 py-1 text-xs hover:bg-white/10"
            onClick={onDetach}
          >
            Destacar janela
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <TeleprompterPanel
          script={script}
          style={style}
          currentLineId={currentLineId}
          currentWordId={currentWordId}
          spokenWordIds={spokenWordIds}
          fontScale={0.7}
          followVoice={!operatorMode}
          freeScroll={operatorMode}
          onScrollSync={onScrollSync}
          onEngineReady={onEngineReady}
        />
      </div>
    </section>
  );
}
