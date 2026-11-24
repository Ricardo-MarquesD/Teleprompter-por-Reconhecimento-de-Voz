import type { Lauda, VisualLine } from "../types/script";

export function activeLaudaForLine(
  laudas: Lauda[],
  visualLines: VisualLine[],
  lineId: string | null,
): string | null {
  if (!lineId) return null;
  const line = visualLines.find((l) => l.id === lineId);
  if (line) return line.lauda_id;

  const ordered = [...laudas].sort((a, b) => a.order - b.order);
  let current: string | null = null;
  for (const lauda of ordered) {
    if (!lauda.first_line_id) continue;
    const first = visualLines.find((l) => l.id === lauda.first_line_id);
    const target = visualLines.find((l) => l.id === lineId);
    if (!first || !target) continue;
    const firstIndex = visualLines.indexOf(first);
    const targetIndex = visualLines.indexOf(target);
    if (targetIndex >= firstIndex) current = lauda.id;
  }
  return current;
}
