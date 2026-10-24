import type { Program, SlugsResponse } from "../service/api";

const SLUGS_KEY = "slugs";

export function loadSlugs(): SlugsResponse | null {
  try {
    const raw = localStorage.getItem(SLUGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SlugsResponse;
    if (!parsed?.programs || !Array.isArray(parsed.programs)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getProgramByName(name: string): Program | undefined {
  return loadSlugs()?.programs.find((program) => program.name === name);
}

export function listProgramNames(): string[] {
  return loadSlugs()?.programs.map((program) => program.name) ?? [];
}
