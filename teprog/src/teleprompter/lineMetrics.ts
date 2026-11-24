export type LineMetric = {
  lineId: string;
  y: number;
  height: number;
};

/** Mede offsetTop de cada linha dentro do container de conteúdo. */
export function measureLineMetrics(
  contentRoot: HTMLElement,
): LineMetric[] {
  const nodes = contentRoot.querySelectorAll<HTMLElement>("[data-line-id]");
  const metrics: LineMetric[] = [];
  for (const node of nodes) {
    const lineId = node.dataset.lineId;
    if (!lineId) continue;
    metrics.push({
      lineId,
      y: node.offsetTop,
      height: node.offsetHeight,
    });
  }
  return metrics;
}

export function indexOfLine(
  metrics: LineMetric[],
  lineId: string,
): number {
  return metrics.findIndex((m) => m.lineId === lineId);
}

export function scrollTopForLine(
  metrics: LineMetric[],
  lineId: string,
  viewportHeight: number,
  pointerRatio: number,
): number | null {
  const metric = metrics.find((m) => m.lineId === lineId);
  if (!metric) return null;
  return Math.max(0, metric.y - viewportHeight * pointerRatio);
}

export function lineIdAtPointer(
  metrics: LineMetric[],
  scrollTop: number,
  viewportHeight: number,
  pointerRatio: number,
): string | null {
  if (metrics.length === 0) return null;
  const pointerY = scrollTop + viewportHeight * pointerRatio;
  let current = metrics[0].lineId;
  for (const metric of metrics) {
    if (metric.y <= pointerY + 1) {
      current = metric.lineId;
    } else {
      break;
    }
  }
  return current;
}

export function pointerPads(
  viewportHeight: number,
  pointerRatio: number,
): { top: number; bottom: number } {
  return {
    top: Math.round(viewportHeight * pointerRatio),
    bottom: Math.round(viewportHeight * (1 - pointerRatio)),
  };
}
