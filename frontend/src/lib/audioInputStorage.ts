export type AudioInputConfig = {
  id: string;
  deviceId: string;
  label: string;
  active: boolean;
};

export const STORAGE_KEY = "audio-input-configs";

export function loadAudioInputConfigs(): AudioInputConfig[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function getActiveAudioInputConfigs(): AudioInputConfig[] {
  return loadAudioInputConfigs().filter((config) => config.active);
}
