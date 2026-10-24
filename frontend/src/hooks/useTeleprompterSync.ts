import { useEffect, useMemo, useRef, useState } from "react";
import {
  collectSpeakableWords,
  flattenProgram,
} from "../lib/buildTeleprompterScript";
import { matchTranscriptToWords } from "../lib/matchTranscriptWords";
import type { Program } from "../service/api";
import type { TeleprompterLine } from "../types/teleprompter";

export function useTeleprompterSync(
  program: Program | null,
  transcript: string,
) {
  const lines: TeleprompterLine[] = useMemo(
    () => (program ? flattenProgram(program) : []),
    [program],
  );

  const speakableWords = useMemo(
    () => collectSpeakableWords(lines),
    [lines],
  );

  const [matchedWordCount, setMatchedWordCount] = useState(0);
  const stableCountRef = useRef(0);
  const programKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = program?.name ?? null;
    if (programKeyRef.current !== key) {
      programKeyRef.current = key;
      stableCountRef.current = 0;
      setMatchedWordCount(0);
    }
  }, [program?.name]);

  useEffect(() => {
    if (speakableWords.length === 0) {
      stableCountRef.current = 0;
      setMatchedWordCount(0);
      return;
    }

    const fromStable = matchTranscriptToWords(
      speakableWords,
      transcript,
      stableCountRef.current,
    );

    const fromStart = matchTranscriptToWords(
      speakableWords,
      transcript,
      0,
    );

    const next = Math.max(fromStable, fromStart);
    if (next > stableCountRef.current) {
      stableCountRef.current = next;
    }

    setMatchedWordCount(stableCountRef.current);
  }, [speakableWords, transcript]);

  return {
    lines,
    matchedWordCount,
    activeWordIndex:
      matchedWordCount > 0 ? matchedWordCount - 1 : null,
  };
}
