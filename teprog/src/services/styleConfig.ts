import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { DEFAULT_STYLE, type StyleConfig } from "../types/style";
import { getStyleConfigPath } from "./paths";

export async function loadStyleConfig(): Promise<StyleConfig> {
  try {
    const path = await getStyleConfigPath();
    const fileExists = await exists(path);
    if (!fileExists) {
      await saveStyleConfig(DEFAULT_STYLE);
      return { ...DEFAULT_STYLE };
    }

    const raw = JSON.parse(await readTextFile(path)) as Partial<StyleConfig>;
    return { ...DEFAULT_STYLE, ...raw };
  } catch (error) {
    console.error("loadStyleConfig:", error);
    return { ...DEFAULT_STYLE };
  }
}

export async function saveStyleConfig(style: StyleConfig): Promise<void> {
  const path = await getStyleConfigPath();
  await writeTextFile(path, JSON.stringify(style, null, 2));
}
