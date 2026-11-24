import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function openOperatorWindow(): Promise<WebviewWindow> {
  const existing = await WebviewWindow.getByLabel("operator");
  if (existing) {
    await existing.setFocus();
    return existing;
  }

  return new WebviewWindow("operator", {
    url: "/#/operator",
    title: "TeproG — Operador",
    width: 720,
    height: 820,
    minWidth: 480,
    minHeight: 400,
    focus: true,
  });
}

export async function openOnAirWindow(): Promise<WebviewWindow> {
  const existing = await WebviewWindow.getByLabel("onair");
  if (existing) {
    await existing.setFocus();
    return existing;
  }

  return new WebviewWindow("onair", {
    url: "/#/onair",
    title: "TeproG — Ao ar",
    width: 960,
    height: 540,
    minWidth: 480,
    minHeight: 270,
    focus: true,
  });
}

export async function closeWindow(label: "operator" | "onair"): Promise<void> {
  const win = await WebviewWindow.getByLabel(label);
  if (win) await win.close();
}
