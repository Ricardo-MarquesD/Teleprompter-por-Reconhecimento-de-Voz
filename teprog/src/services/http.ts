import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

/** Fetch via plugin HTTP (sem CORS do webview). */
export async function localFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  return tauriFetch(input, init);
}
