import { useCallback, useEffect, useRef, useState } from "react";
import { getActiveAudioInputConfigs } from "../lib/audioInputStorage";

type CaptureStatus = "idle" | "listening" | "error";

const LANG = "pt-BR";

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechCapture() {
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const listeningRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const committedRef = useRef("");
  const sessionFinalRef = useRef("");

  const stop = useCallback(() => {
    listeningRef.current = false;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
    }

    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setStatus("error");
      setError("Reconhecimento de voz não é suportado neste navegador.");
      return;
    }

    stop();
    listeningRef.current = true;
    committedRef.current = "";
    sessionFinalRef.current = "";
    setTranscript("");
    setError(null);
    setStatus("listening");

    const preferred = getActiveAudioInputConfigs()[0];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: preferred?.deviceId
          ? { deviceId: { ideal: preferred.deviceId } }
          : true,
      });
      // Web Speech API usa o mic do SO; o stream só libera a permissão.
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("[speech] getUserMedia failed", err);
      listeningRef.current = false;
      setStatus("error");
      setError("Não foi possível acessar o microfone.");
      return;
    }

    if (!listeningRef.current) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANG;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let sessionFinal = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          sessionFinal += `${piece} `;
        } else {
          interim = piece;
        }
      }

      sessionFinalRef.current = sessionFinal.trim();
      const full = `${committedRef.current} ${sessionFinal} ${interim}`
        .replace(/\s+/g, " ")
        .trim();

      console.debug("[speech]", full);
      setError(null);
      setTranscript(full);
    };

    recognition.onerror = (event) => {
      console.warn("[speech] error", event.error, event.message);
      if (
        event.error === "aborted" ||
        event.error === "no-speech" ||
        event.error === "network"
      ) {
        // network/no-speech: o onend tenta reiniciar se ainda estiver ouvindo
        return;
      }
      if (!listeningRef.current) return;
      listeningRef.current = false;
      setStatus("error");
      setError(event.message || `Erro de reconhecimento: ${event.error}`);
    };

    recognition.onend = () => {
      if (sessionFinalRef.current) {
        committedRef.current = `${committedRef.current} ${sessionFinalRef.current}`
          .replace(/\s+/g, " ")
          .trim();
        sessionFinalRef.current = "";
      }

      if (!listeningRef.current) return;

      try {
        recognition.start();
      } catch (err) {
        console.warn("[speech] restart failed", err);
      }
    };

    try {
      recognition.start();
      console.debug("[speech] started", preferred?.label ?? "default mic");
    } catch (err) {
      console.error("[speech] start failed", err);
      listeningRef.current = false;
      setStatus("error");
      setError("Não foi possível iniciar o reconhecimento de voz.");
    }
  }, [stop]);

  const clearTranscript = useCallback(() => {
    committedRef.current = "";
    sessionFinalRef.current = "";
    setTranscript("");
  }, []);

  const toggle = useCallback(() => {
    if (listeningRef.current) {
      stop();
    } else {
      void start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  return {
    status,
    error,
    transcript,
    clearTranscript,
    start,
    stop,
    toggle,
    isSupported: getSpeechRecognitionCtor() !== null,
  };
}
