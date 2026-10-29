type SpeechCaptureButtonProps = {
  listening: boolean;
  reconnecting?: boolean;
  error: string | null;
  transcript: string;
  isSupported: boolean;
  onToggle: () => void;
  className?: string;
};

export function SpeechCaptureButton({
  listening,
  reconnecting = false,
  error,
  transcript,
  isSupported,
  onToggle,
  className = "",
}: SpeechCaptureButtonProps) {
  const active = listening || reconnecting;

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`.trim()}>
      <button
        type="button"
        className="rounded-md border border-current/25 px-3 py-2 text-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10"
        aria-pressed={active}
        disabled={!isSupported}
        onClick={onToggle}
      >
        {active ? "Parar captura" : "Iniciar captura"}
      </button>

      {active && (
        <p
          className="max-w-xs truncate text-xs opacity-70"
          role="status"
          title={transcript || undefined}
        >
          {reconnecting
            ? "Reconectando reconhecimento…"
            : transcript || "Ouvindo…"}
        </p>
      )}

      {error && (
        <p
          className="max-w-xs text-xs text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
