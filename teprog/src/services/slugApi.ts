import type { ProcessBootstrap } from "../types/messages";
import type { ScriptMeta } from "../types/script";
import { localFetch } from "./http";

function baseUrl(boot: ProcessBootstrap): string {
  return `http://${boot.host}:${boot.port}`;
}

export async function slugHealth(boot: ProcessBootstrap): Promise<boolean> {
  const res = await localFetch(`${baseUrl(boot)}/api/health`);
  return res.ok;
}

export async function importScriptFile(
  boot: ProcessBootstrap,
  filePath: string,
  fileName: string,
  bytes: Uint8Array,
): Promise<{ file: string; meta: ScriptMeta }> {
  const form = new FormData();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: "application/json" });
  form.append(
    "file",
    blob,
    fileName || filePath.split(/[/\\]/).pop() || "script.json",
  );

  const res = await localFetch(`${baseUrl(boot)}/api/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${boot.token}`,
    },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Import falhou (${res.status})`);
  }

  const json = (await res.json()) as {
    status: string;
    file: string;
    meta: ScriptMeta;
  };
  return { file: json.file, meta: json.meta };
}
