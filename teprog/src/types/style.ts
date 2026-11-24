export type TextAlign = "left" | "center" | "right";
export type AspectRatio = "16:9" | "4:3";

export type StyleConfig = {
  fontFamily: string;
  fontSizePx: number;
  textAlign: TextAlign;
  colorNormal: string;
  colorCurrent: string;
  colorCurrentFg: string;
  colorSpoken: string;
  pointerColor: string;
  showPointer: boolean;
  aspectRatio: AspectRatio;
  pointerRatio: number;
};

export const DEFAULT_STYLE: StyleConfig = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSizePx: 36,
  textAlign: "center",
  colorNormal: "#ffffff",
  colorCurrent: "#fcd34d",
  colorCurrentFg: "#000000",
  colorSpoken: "#047857",
  pointerColor: "#dc2626",
  showPointer: true,
  aspectRatio: "16:9",
  pointerRatio: 0.38,
};

export const ASPECT_RATIO_VALUE: Record<AspectRatio, number> = {
  "16:9": 16 / 9,
  "4:3": 4 / 3,
};
