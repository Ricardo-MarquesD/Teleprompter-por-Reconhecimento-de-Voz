import type { DeviceConfig, DeviceInfo, ProcessBootstrap } from "../types/messages";
import { localFetch } from "./http";

function baseUrl(boot: ProcessBootstrap): string {
  return `http://${boot.host}:${boot.port}`;
}

function authHeaders(boot: ProcessBootstrap): HeadersInit {
  return { Authorization: `Bearer ${boot.token}` };
}

export async function tpHealth(boot: ProcessBootstrap): Promise<{
  active: boolean;
  script_ready: boolean;
  model_ready: boolean;
}> {
  const res = await localFetch(`${baseUrl(boot)}/api/health`);
  if (!res.ok) throw new Error(`tp health ${res.status}`);
  return res.json();
}

export async function listDevices(boot: ProcessBootstrap): Promise<{
  devices: DeviceInfo[];
  selected: DeviceConfig;
}> {
  const res = await localFetch(`${baseUrl(boot)}/api/devices`, {
    headers: authHeaders(boot),
  });
  if (!res.ok) throw new Error(`devices ${res.status}`);
  return res.json();
}

export async function selectDevice(
  boot: ProcessBootstrap,
  deviceId: number | null,
): Promise<DeviceConfig> {
  const res = await localFetch(`${baseUrl(boot)}/api/devices`, {
    method: "POST",
    headers: {
      ...authHeaders(boot),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_id: deviceId }),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as { selected: DeviceConfig };
  return json.selected;
}
