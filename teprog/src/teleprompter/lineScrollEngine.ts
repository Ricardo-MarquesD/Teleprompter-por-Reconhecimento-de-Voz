import {
  indexOfLine,
  measureLineMetrics,
  scrollTopForLine,
  type LineMetric,
} from "./lineMetrics";

const BASE_SPEED_PX = 2.2;
const SPEED_PER_LINE_PX = 3.4;
const MAX_SPEED_PX = 48;
const MIN_LERP = 0.08;
const MAX_LERP = 0.28;
const EPSILON = 0.4;

export type LineScrollEngineOptions = {
  pointerRatio: number;
  onFrame?: (scrollTop: number, targetLineId: string | null) => void;
};

/**
 * Rolagem contínua via requestAnimationFrame.
 * Velocidade sobe com |deltaLines| quando o alvo muda.
 */
export class LineScrollEngine {
  private scroller: HTMLElement | null = null;
  private contentRoot: HTMLElement | null = null;
  private metrics: LineMetric[] = [];
  private pointerRatio: number;
  private rafId: number | null = null;
  private targetScrollTop = 0;
  private targetLineId: string | null = null;
  private maxSpeed = BASE_SPEED_PX;
  private lerp = MIN_LERP;
  private onFrame?: (scrollTop: number, targetLineId: string | null) => void;
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: LineScrollEngineOptions) {
    this.pointerRatio = options.pointerRatio;
    this.onFrame = options.onFrame;
  }

  attach(scroller: HTMLElement, contentRoot: HTMLElement): void {
    this.detach();
    this.scroller = scroller;
    this.contentRoot = contentRoot;
    this.rebuildMetrics();
    this.resizeObserver = new ResizeObserver(() => {
      this.rebuildMetrics();
      if (this.targetLineId) {
        this.setTargetLine(this.targetLineId, { instant: false, deltaLines: 0 });
      }
    });
    this.resizeObserver.observe(scroller);
    this.resizeObserver.observe(contentRoot);
  }

  detach(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.scroller = null;
    this.contentRoot = null;
    this.metrics = [];
  }

  setPointerRatio(ratio: number): void {
    this.pointerRatio = ratio;
    if (this.targetLineId) {
      this.setTargetLine(this.targetLineId, { instant: false, deltaLines: 0 });
    }
  }

  rebuildMetrics(): void {
    if (!this.contentRoot) {
      this.metrics = [];
      return;
    }
    this.metrics = measureLineMetrics(this.contentRoot);
  }

  getMetrics(): LineMetric[] {
    return this.metrics;
  }

  setTargetLine(
    lineId: string,
    options: { instant?: boolean; deltaLines?: number } = {},
  ): void {
    const scroller = this.scroller;
    if (!scroller) return;

    this.rebuildMetrics();
    const next = scrollTopForLine(
      this.metrics,
      lineId,
      scroller.clientHeight,
      this.pointerRatio,
    );
    if (next === null) return;

    const previousIndex = this.targetLineId
      ? indexOfLine(this.metrics, this.targetLineId)
      : -1;
    const nextIndex = indexOfLine(this.metrics, lineId);
    const delta =
      options.deltaLines ??
      (previousIndex >= 0 && nextIndex >= 0
        ? Math.abs(nextIndex - previousIndex)
        : 1);

    this.targetLineId = lineId;
    this.targetScrollTop = next;
    this.maxSpeed = Math.min(
      MAX_SPEED_PX,
      BASE_SPEED_PX + Math.max(1, delta) * SPEED_PER_LINE_PX,
    );
    this.lerp = Math.min(
      MAX_LERP,
      MIN_LERP + Math.max(0, delta - 1) * 0.035,
    );

    if (options.instant) {
      scroller.scrollTop = next;
      this.onFrame?.(scroller.scrollTop, this.targetLineId);
      return;
    }

    this.start();
  }

  /** Espelha scroll absoluto (modo operador 1:1). */
  setScrollTopImmediate(scrollTop: number): void {
    const scroller = this.scroller;
    if (!scroller) return;
    this.stop();
    scroller.scrollTop = scrollTop;
    this.targetScrollTop = scrollTop;
    this.onFrame?.(scroller.scrollTop, this.targetLineId);
  }

  private start(): void {
    if (this.rafId !== null) return;
    const tick = () => {
      this.rafId = null;
      const scroller = this.scroller;
      if (!scroller) return;

      const current = scroller.scrollTop;
      const delta = this.targetScrollTop - current;
      if (Math.abs(delta) <= EPSILON) {
        scroller.scrollTop = this.targetScrollTop;
        this.onFrame?.(scroller.scrollTop, this.targetLineId);
        return;
      }

      const stepped = Math.sign(delta) * Math.min(Math.abs(delta), this.maxSpeed);
      const lerped = current + delta * this.lerp;
      const next =
        Math.abs(stepped) < Math.abs(lerped - current) ? current + stepped : lerped;

      scroller.scrollTop = next;
      this.onFrame?.(scroller.scrollTop, this.targetLineId);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
