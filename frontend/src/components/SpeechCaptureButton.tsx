import { useUnifiedSpeechCapture } from "../hooks/useUnifiedSpeechCapture";

type SpeechCaptureButtonProps = {
  onTranscript: (text: string) => void;
  className?: string;
};

export function SpeechCaptureButton({
  onTranscript,
  className = "",
}: SpeechCaptureButtonProps) {
  const {
    status,
    error,
    partialFallback,
    toggle,
    isSupported,
  } = useUnifiedSpeechCapture();

  const listening = status === "listening";

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <button
        type="button"
        className="rounded-md border border-current/25 px-3 py-2 text-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10"
        aria-pressed={listening}
        disabled={!isSupported}
        onClick={() => toggle(onTranscript)}
      >
        {listening ? "Parar captura" : "Iniciar captura"}
      </button>

      {partialFallback && listening && (
        <p
          className="max-w-xs text-xs opacity-70"
          role="status"
        >
          O navegador limitou o reconhecimento simultâneo; a
          transcrição pode usar apenas o microfone padrão.
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
