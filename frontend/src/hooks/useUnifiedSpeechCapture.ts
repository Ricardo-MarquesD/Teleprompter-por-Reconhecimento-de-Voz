import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AudioInputConfig,
  getActiveAudioInputConfigs,
} from "../lib/audioInputStorage";

type CaptureStatus = "idle" | "listening" | "error";

const RECOGNITION_LANG = "pt-BR";

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | null {
  if (typeof window === "undefined") return null;
  return (
    window.SpeechRecognition ??
    window.webkitSpeechRecognition ??
    null
  );
}

function buildUnifiedText(
  configs: AudioInputConfig[],
  segments: Map<string, string>,
): string {
  return configs
    .map((config) => segments.get(config.label)?.trim())
    .filter(Boolean)
    .join(" ");
}

export function useUnifiedSpeechCapture() {
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [partialFallback, setPartialFallback] = useState(false);

  const listeningRef = useRef(false);
  const manualStopRef = useRef(false);
  const configsRef = useRef<AudioInputConfig[]>([]);
  const segmentsRef = useRef(new Map<string, string>());
  const onTranscriptRef = useRef<((text: string) => void) | null>(
    null,
  );
  const streamsRef = useRef<MediaStream[]>([]);
  const recognizersRef = useRef<SpeechRecognition[]>([]);

  const notifyTranscript = useCallback(() => {
    const unified = buildUnifiedText(
      configsRef.current,
      segmentsRef.current,
    );
    onTranscriptRef.current?.(unified);
  }, []);

  const releaseResources = useCallback(() => {
    for (const recognition of recognizersRef.current) {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
    }
    recognizersRef.current = [];

    for (const stream of streamsRef.current) {
      stream.getTracks().forEach((track) => track.stop());
    }
    streamsRef.current = [];
  }, []);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    listeningRef.current = false;
    releaseResources();
    setStatus("idle");
    setPartialFallback(false);
  }, [releaseResources]);

  const attachRecognizerHandlers = useCallback(
    (recognition: SpeechRecognition, label: string) => {
      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i][0]?.transcript ?? "";
          if (event.results[i].isFinal) {
            finalText += piece;
          } else {
            interimText = piece;
          }
        }

        const transcript = `${finalText}${interimText}`.trim();
        segmentsRef.current.set(label, transcript);
        notifyTranscript();
      };

      recognition.onerror = (event) => {
        if (
          event.error === "aborted" ||
          event.error === "no-speech"
        ) {
          return;
        }
        listeningRef.current = false;
        releaseResources();
        setStatus("error");
        setError(
          event.message ||
            "Erro durante o reconhecimento de voz.",
        );
      };

      recognition.onend = () => {
        if (
          !listeningRef.current ||
          manualStopRef.current
        ) {
          return;
        }
        try {
          recognition.start();
        } catch {
          /* restart may fail if already starting */
        }
      };
    },
    [notifyTranscript, releaseResources],
  );

  const startSingleFallbackRecognizer = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = RECOGNITION_LANG;

    attachRecognizerHandlers(
      recognition,
      configsRef.current[0]?.label ?? "default",
    );

    recognition.start();
    recognizersRef.current = [recognition];
    setPartialFallback(true);
  }, [attachRecognizerHandlers]);

  const start = useCallback(
    async (onTranscript: (text: string) => void) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setStatus("error");
        setError(
          "Reconhecimento de voz não é suportado neste navegador.",
        );
        return;
      }

      const activeConfigs = getActiveAudioInputConfigs();
      if (activeConfigs.length === 0) {
        setStatus("error");
        setError(
          "Nenhuma entrada de áudio ativa. Configure em Settings → Entradas de áudio.",
        );
        return;
      }

      stop();
      manualStopRef.current = false;
      listeningRef.current = true;
      onTranscriptRef.current = onTranscript;
      configsRef.current = activeConfigs;
      segmentsRef.current = new Map();
      setError(null);
      setPartialFallback(false);
      setStatus("listening");

      try {
        const streams = await Promise.all(
          activeConfigs.map((config) =>
            navigator.mediaDevices.getUserMedia({
              audio: config.deviceId
                ? { deviceId: { exact: config.deviceId } }
                : true,
            }),
          ),
        );
        streamsRef.current = streams;

        if (!listeningRef.current) {
          releaseResources();
          return;
        }

        const recognizers: SpeechRecognition[] = [];
        let usedFallback = false;

        for (const config of activeConfigs) {
          const recognition = new Ctor();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = RECOGNITION_LANG;
          attachRecognizerHandlers(recognition, config.label);

          try {
            recognition.start();
            recognizers.push(recognition);
          } catch {
            for (const started of recognizers) {
              try {
                started.abort();
              } catch {
                /* ignore */
              }
            }
            usedFallback = true;
            break;
          }
        }

        if (!listeningRef.current) {
          releaseResources();
          return;
        }

        if (usedFallback || recognizers.length === 0) {
          startSingleFallbackRecognizer();
        } else {
          recognizersRef.current = recognizers;
          if (recognizers.length < activeConfigs.length) {
            setPartialFallback(true);
          }
        }
      } catch {
        listeningRef.current = false;
        releaseResources();
        setStatus("error");
        setError(
          "Não foi possível acessar um ou mais microfones.",
        );
      }
    },
    [
      attachRecognizerHandlers,
      releaseResources,
      startSingleFallbackRecognizer,
      stop,
    ],
  );

  const toggle = useCallback(
    (onTranscript: (text: string) => void) => {
      if (listeningRef.current) {
        stop();
      } else {
        void start(onTranscript);
      }
    },
    [start, stop],
  );

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      listeningRef.current = false;
      releaseResources();
    };
  }, [releaseResources]);

  return {
    status,
    error,
    partialFallback,
    start,
    stop,
    toggle,
    isSupported: getSpeechRecognitionCtor() !== null,
  };
}
