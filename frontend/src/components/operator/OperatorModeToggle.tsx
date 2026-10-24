type OperatorModeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function OperatorModeToggle({
  enabled,
  onChange,
}: OperatorModeToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className={`rounded-md border px-3 py-2 text-sm ${
          enabled
            ? "border-w_font bg-w_font text-bg_white dark:border-d_font dark:bg-d_font dark:text-bg_dark"
            : "border-current/25 hover:bg-black/5 dark:hover:bg-white/10"
        }`}
        aria-pressed={enabled}
        onClick={() => onChange(!enabled)}
      >
        Modo operador: {enabled ? "ativo" : "inativo"}
      </button>
      <p className="text-sm opacity-70" role="status">
        {enabled
          ? "Rolagem manual liberada; use o ponteiro central como guia."
          : "A rolagem acompanha automaticamente a fala reconhecida."}
      </p>
    </div>
  );
}
