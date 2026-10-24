import type { Program } from "../service/api";
import type {
  TeleprompterLine,
  TeleprompterSegment,
} from "../types/teleprompter";

const COMMAND_PATTERN = /\{\{.*?\}\}/g;

function tokenizeSpeakText(text: string): TeleprompterSegment[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  return trimmed.split(/\s+/).map((word) => ({
    kind: "speak" as const,
    text: word,
    wordIndex: null,
  }));
}

function parseTextLine(line: string): TeleprompterSegment[] {
  const segments: TeleprompterSegment[] = [];
  let lastIndex = 0;
  const matches = line.matchAll(COMMAND_PATTERN);

  for (const match of matches) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push(
        ...tokenizeSpeakText(line.slice(lastIndex, start)),
      );
    }
    segments.push({
      kind: "technical",
      text: match[0],
      wordIndex: null,
    });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < line.length) {
    segments.push(...tokenizeSpeakText(line.slice(lastIndex)));
  }

  if (segments.length === 0 && line.trim()) {
    return tokenizeSpeakText(line);
  }

  return segments;
}

function assignWordIndices(
  lines: TeleprompterLine[],
): TeleprompterLine[] {
  let wordIndex = 0;

  return lines.map((line) => ({
    ...line,
    segments: line.segments.map((segment) => {
      if (segment.kind !== "speak") return segment;
      const assigned = { ...segment, wordIndex };
      wordIndex += 1;
      return assigned;
    }),
  }));
}

export function flattenProgram(program: Program): TeleprompterLine[] {
  const lines: TeleprompterLine[] = [];
  let lineCounter = 0;

  for (const block of program.blocks) {
    for (const subblock of block.subblocks) {
      for (const rawLine of subblock.lines) {
        const segments: TeleprompterSegment[] =
          subblock.type === "technical"
            ? [
                {
                  kind: "technical",
                  text: rawLine,
                  wordIndex: null,
                },
              ]
            : parseTextLine(rawLine);

        if (segments.length === 0) continue;

        lines.push({
          id: `${program.name}-${lineCounter}`,
          segments,
        });
        lineCounter += 1;
      }
    }
  }

  return assignWordIndices(lines);
}

export function collectSpeakableWords(
  lines: TeleprompterLine[],
): string[] {
  const words: string[] = [];

  for (const line of lines) {
    for (const segment of line.segments) {
      if (segment.kind === "speak" && segment.wordIndex !== null) {
        words[segment.wordIndex] = segment.text;
      }
    }
  }

  return words;
}
