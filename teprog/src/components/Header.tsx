import { Dropdown } from "./menu/Dropdown";

type HeaderProps = {
  programName: string | null;
  servicesReady: boolean;
  captureStatus: string;
  operatorMode: boolean;
  statusMessage: string | null;
  onImport: () => void;
  onOpenMic: () => void;
  onOpenLayout: () => void;
  onToggleCapture: () => void;
  onToggleOperatorMode: () => void;
};

export function Header({
  programName,
  servicesReady,
  captureStatus,
  operatorMode,
  statusMessage,
  onImport,
  onOpenMic,
  onOpenLayout,
  onToggleCapture,
  onToggleOperatorMode,
}: HeaderProps) {
  const capturing =
    captureStatus === "listening" || captureStatus === "starting";

  return (
    <header className="flex items-center gap-3 border-b border-current/15 px-3 py-2">
      <div className="flex items-center gap-1">
        <span className="mr-2 text-lf font-semibold tracking-wide">TeproG</span>
        <Dropdown
          label="File"
          items={[
            {
              label: "Importar roteiro…",
              onClick: onImport,
              disabled: !servicesReady,
            },
          ]}
        />
        <Dropdown
          label="Settings"
          items={[
            {
              label: "Microfone…",
              onClick: onOpenMic,
              disabled: !servicesReady,
            },
          ]}
        />
        <Dropdown
          label="Layout"
          items={[{ label: "Estilo do teleprompter…", onClick: onOpenLayout }]}
        />
      </div>

      <button
        type="button"
        disabled={!servicesReady}
        className={`rounded-md border px-3 py-1.5 text-sf ${
          capturing
            ? "border-red-500/60 bg-red-600/20 text-red-200"
            : "border-current/25 hover:bg-white/10"
        } disabled:opacity-40`}
        onClick={onToggleCapture}
      >
        {capturing ? "Parar captura" : "Iniciar captura"}
      </button>

      <div className="min-w-0 flex-1 truncate text-xs opacity-70">
        {programName ?? "Sem roteiro"}
        {statusMessage ? ` · ${statusMessage}` : ""}
      </div>

      <button
        type="button"
        className={`rounded-md border px-3 py-1.5 text-sf ${
          operatorMode
            ? "border-emerald-400/50 bg-emerald-500/15"
            : "border-current/25 hover:bg-white/10"
        }`}
        onClick={onToggleOperatorMode}
      >
        Modo operador: {operatorMode ? "ligado" : "desligado"}
      </button>
    </header>
  );
}
