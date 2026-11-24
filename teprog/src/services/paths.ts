import { join, localDataDir, configDir } from "@tauri-apps/api/path";
import { mkdir, exists } from "@tauri-apps/plugin-fs";

const APP_AUTHOR = "Squad42";
const APP_NAME = "TeproG";

async function ensureDir(path: string): Promise<string> {
  try {
    if (!(await exists(path))) {
      await mkdir(path, { recursive: true });
    }
  } catch (error) {
    console.warn("ensureDir falhou:", path, error);
  }
  return path;
}

/** Espelha tasks/common/paths.py (platformdirs). */
export async function getLocalDir(): Promise<string> {
  const base = await localDataDir();
  return ensureDir(await join(base, APP_AUTHOR, APP_NAME));
}

export async function getRoamingDir(): Promise<string> {
  const base = await configDir();
  return ensureDir(await join(base, APP_AUTHOR, APP_NAME));
}

export async function getConfigDir(): Promise<string> {
  const roaming = await getRoamingDir();
  return ensureDir(await join(roaming, "config"));
}

export async function getSlugScriptPath(): Promise<string> {
  return join(await getLocalDir(), "slug_script.json");
}

export async function getStyleConfigPath(): Promise<string> {
  return join(await getConfigDir(), "config_style.json");
}

export async function getDeviceConfigPath(): Promise<string> {
  return join(await getConfigDir(), "config_device.json");
}
