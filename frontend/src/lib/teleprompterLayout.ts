export type TextAlign = "left" | "center" | "right";

export type LayoutSection = "font" | "fontSize" | "align" | "colors";

export type TeleprompterLayout = {
  fontFamily: string;
  fontSizePx: number;
  textAlign: TextAlign;
  colorNormal: string;
  colorCurrent: string;
  colorCurrentFg: string;
  colorSpoken: string;
};

export const LAYOUT_STORAGE_KEY = "teleprompter-layout";

export const DEFAULT_LAYOUT: TeleprompterLayout = {
  fontFamily: "",
  fontSizePx: 36,
  textAlign: "center",
  colorNormal: "",
  colorCurrent: "#fcd34d",
  colorCurrentFg: "#000000",
  colorSpoken: "#047857",
};

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Padrão do sistema", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "system-ui", value: "system-ui, sans-serif" },
];

export function loadTeleprompterLayout(): TeleprompterLayout {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_LAYOUT };
    const parsed = JSON.parse(raw) as Partial<TeleprompterLayout>;
    return { ...DEFAULT_LAYOUT, ...parsed };
  } catch {
    return { ...DEFAULT_LAYOUT };
  }
}

export function saveTeleprompterLayout(layout: TeleprompterLayout): void {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}
