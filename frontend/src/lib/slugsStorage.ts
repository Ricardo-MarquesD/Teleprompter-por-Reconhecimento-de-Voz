import type { SlugsResponse } from "../service/api";

export const SLUGS_STORAGE_KEY = "slugs";
export const SLUGS_UPDATED_EVENT = "slugs-updated";

export function loadSlugs(): SlugsResponse | null {
  try {
    const value = localStorage.getItem(SLUGS_STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as SlugsResponse;
    if (!parsed || !Array.isArray(parsed.programs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSlugs(data: SlugsResponse): void {
  localStorage.setItem(SLUGS_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(SLUGS_UPDATED_EVENT));
}
