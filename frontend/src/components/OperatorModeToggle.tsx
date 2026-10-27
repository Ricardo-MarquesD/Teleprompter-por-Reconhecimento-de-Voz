type OperatorModeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function OperatorModeToggle({
  enabled,
  onChange,
}: OperatorModeToggleProps) {
  return (
    <button
      type="button"
      className="rounded-md border border-current/25 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
    >
      {enabled ? "Modo operador: ligado" : "Modo operador: desligado"}
    </button>
  );
}
