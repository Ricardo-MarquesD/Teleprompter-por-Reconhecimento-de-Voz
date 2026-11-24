import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import type { SlugScript } from "../types/script";
import { getSlugScriptPath } from "./paths";

export async function loadSlugScript(): Promise<SlugScript | null> {
  const path = await getSlugScriptPath();
  if (!(await exists(path))) return null;

  const raw = JSON.parse(await readTextFile(path)) as SlugScript;
  if (!raw?.meta || !Array.isArray(raw.visual_lines) || !Array.isArray(raw.laudas)) {
    throw new Error("slug_script.json inválido");
  }
  return raw;
}
