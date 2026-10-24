export type SegmentKind = "speak" | "technical";

export type TeleprompterSegment = {
  kind: SegmentKind;
  text: string;
  wordIndex: number | null;
};

export type TeleprompterLine = {
  id: string;
  segments: TeleprompterSegment[];
};
