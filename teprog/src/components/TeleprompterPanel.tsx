import { useEffect, useRef, useState } from "react";
import type { SlugScript } from "../types/script";
import type { StyleConfig } from "../types/style";
import { LineScrollEngine } from "../teleprompter/lineScrollEngine";
import {
  lineIdAtPointer,
  pointerPads,
} from "../teleprompter/lineMetrics";
import { PointerArrow } from "./PointerArrow";
import { ScriptLines } from "./ScriptLines";

type TeleprompterPanelProps = {
  script: SlugScript | null;
  style: StyleConfig;
  currentLineId: string | null;
  currentWordId: number | null;
  spokenWordIds: number[];
  fontScale?: number;
  hideScrollbar?: boolean;
  /** Quando true, ignora alvo de voz e espelha scrollTop externo. */
  mirrorScrollTop?: number | null;
  followVoice?: boolean;
  freeScroll?: boolean;
  onScrollSync?: (payload: {
    scrollTop: number;
    lineId: string | null;
  }) => void;
  onEngineReady?: (engine: LineScrollEngine | null) => void;
};

export function TeleprompterPanel({
  script,
  style,
  currentLineId,
  currentWordId,
  spokenWordIds,
  fontScale = 1,
  hideScrollbar = false,
  mirrorScrollTop = null,
  followVoice = true,
  freeScroll = false,
  onScrollSync,
  onEngineReady,
}: TeleprompterPanelProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LineScrollEngine | null>(null);
  const lastLineRef = useRef<string | null>(null);
  const onScrollSyncRef = useRef(onScrollSync);
  const onEngineReadyRef = useRef(onEngineReady);
  onScrollSyncRef.current = onScrollSync;
  onEngineReadyRef.current = onEngineReady;
  const [pads, setPads] = useState({ top: 120, bottom: 200 });

  useEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    const engine = new LineScrollEngine({
      pointerRatio: style.pointerRatio,
      onFrame: (scrollTop, lineId) => {
        onScrollSyncRef.current?.({ scrollTop, lineId });
      },
    });
    engine.attach(scroller, content);
    engineRef.current = engine;
    onEngineReadyRef.current?.(engine);

    const updatePads = () => setPads(pointerPads(scroller.clientHeight, style.pointerRatio));
    updatePads();
    const ro = new ResizeObserver(updatePads);
    ro.observe(scroller);

    return () => {
      ro.disconnect();
      engine.detach();
      engineRef.current = null;
      onEngineReadyRef.current?.(null);
    };
  }, [style.pointerRatio]);

  useEffect(() => {
    engineRef.current?.setPointerRatio(style.pointerRatio);
  }, [style.pointerRatio]);

  useEffect(() => {
    engineRef.current?.rebuildMetrics();
  }, [script, style.fontSizePx, style.fontFamily, style.textAlign]);

  useEffect(() => {
    if (mirrorScrollTop !== null && mirrorScrollTop !== undefined) {
      engineRef.current?.setScrollTopImmediate(mirrorScrollTop);
      return;
    }

    if (!followVoice || freeScroll || !currentLineId) return;

    const previous = lastLineRef.current;
    const metrics = engineRef.current?.getMetrics() ?? [];
    const prevIndex = previous
      ? metrics.findIndex((m) => m.lineId === previous)
      : -1;
    const nextIndex = metrics.findIndex((m) => m.lineId === currentLineId);
    const deltaLines =
      prevIndex >= 0 && nextIndex >= 0 ? Math.abs(nextIndex - prevIndex) : 1;

    engineRef.current?.setTargetLine(currentLineId, {
      instant: previous === null,
      deltaLines: Math.max(1, deltaLines),
    });
    lastLineRef.current = currentLineId;
  }, [currentLineId, followVoice, freeScroll, mirrorScrollTop]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !freeScroll) return;

    const onScroll = () => {
      const metrics = engineRef.current?.getMetrics() ?? [];
      const lineId = lineIdAtPointer(
        metrics,
        scroller.scrollTop,
        scroller.clientHeight,
        style.pointerRatio,
      );
      onScrollSync?.({ scrollTop: scroller.scrollTop, lineId });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [freeScroll, onScrollSync, style.pointerRatio]);

  return (
    <div className="relative h-full min-h-0 bg-panel text-white">
      <PointerArrow
        color={style.pointerColor}
        topPercent={style.pointerRatio}
        visible={style.showPointer && Boolean(style.pointerColor)}
      />
      <div
        ref={scrollerRef}
        className={`h-full overflow-y-auto ${hideScrollbar ? "scrollbar-none" : "scrollbar-sm"}`}
      >
        <div
          ref={contentRef}
          style={{ paddingTop: pads.top, paddingBottom: pads.bottom }}
        >
          {script ? (
            <ScriptLines
              lines={script.visual_lines}
              matchingWords={script.matching_words}
              style={style}
              currentLineId={currentLineId}
              currentWordId={currentWordId}
              spokenWordIds={spokenWordIds}
              fontScale={fontScale}
            />
          ) : (
            <p className="px-6 py-16 text-center text-sm opacity-60">
              Importe um roteiro em File para começar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
