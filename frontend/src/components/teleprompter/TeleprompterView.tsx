import { useCallback, useEffect, useRef, useState } from "react";
import { useTeleprompterSync } from "../../hooks/useTeleprompterSync";
import type { Program } from "../../service/api";
import { TeleprompterLine } from "./TeleprompterLine";

type TeleprompterViewProps = {
  program: Program | null;
  transcript: string;
  manualMode: boolean;
};

export function TeleprompterView({
  program,
  transcript,
  manualMode,
}: TeleprompterViewProps) {
  const { lines, matchedWordCount, activeWordIndex } =
    useTeleprompterSync(program, transcript);

  const shellRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollToActiveWord = useCallback(() => {
    if (manualMode || activeWordIndex === null) return;

    const container = scrollRef.current;
    if (!container) return;

    const target = container.querySelector(
      `[data-word-index="${activeWordIndex}"]`,
    ) as HTMLElement | null;

    if (!target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const pointerY = containerRect.top + containerRect.height / 2;
    const delta = targetRect.top + targetRect.height / 2 - pointerY;

    container.scrollTop += delta;
  }, [activeWordIndex, manualMode]);

  useEffect(() => {
    const frame = requestAnimationFrame(scrollToActiveWord);
    return () => cancelAnimationFrame(frame);
  }, [scrollToActiveWord, matchedWordCount]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  async function toggleFullscreen() {
    const element = shellRef.current;
    if (!element) return;

    if (document.fullscreenElement === element) {
      await document.exitFullscreen();
      return;
    }

    await element.requestFullscreen();
  }

  const emptyMessage = !program
    ? "Selecione um programa na barra à esquerda."
    : lines.length === 0
      ? "Este programa não possui texto para exibir."
      : null;

  return (
    <div
      className={
        isFullscreen
          ? "flex h-full w-full items-center justify-center bg-black p-4"
          : "flex min-h-0 w-full max-w-5xl flex-col"
      }
    >
      <div
        ref={shellRef}
        className={`relative flex w-full flex-col overflow-hidden rounded-lg border border-current/20 bg-bg_white text-w_font shadow-lg dark:bg-bg_dark dark:text-d_font ${
          isFullscreen
            ? "h-full max-h-full max-w-full aspect-[4/3]"
            : "aspect-[4/3] max-h-[min(80dvh,calc(100vw*0.75))]"
        }`}
      >
        <div className="absolute top-2 right-2 z-20">
          <button
            type="button"
            className="rounded-md border border-current/25 bg-black/10 px-2 py-1 text-xs hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto overscroll-contain px-8 py-16"
          >
            {emptyMessage ? (
              <p className="text-center text-lg opacity-70">
                {emptyMessage}
              </p>
            ) : (
              lines.map((line) => (
                <TeleprompterLine
                  key={line.id}
                  line={line}
                  matchedWordCount={matchedWordCount}
                />
              ))
            )}
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 border-t-2 border-red-500/80"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
