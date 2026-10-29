import type { Block, Program } from "../service/api";

export type PromptWord = {
  display: string;
  /** Índice da primeira palavra do roteiro coberta por este token visual. */
  scriptIndex: number | null;
  /** Exclusivo: fim do intervalo no roteiro (para tokens com hífen). */
  scriptIndexEnd: number | null;
};

export type PromptLine = {
  id: number;
  text: string;
  technical: boolean;
  words: PromptWord[];
};

export type PreparedScript = {
  lines: PromptLine[];
  scriptWords: string[];
};

export type ScriptBlockItem = {
  id: string;
  title: string;
  block: Block;
};

const COMMAND_PATTERN = /\{\{[\s\S]*?\}\}/;

export function isCommandText(text: string): boolean {
  return COMMAND_PATTERN.test(text.trim());
}

export function normalizeWord(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function tokenizeDisplay(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Partes de matching (espaço e hífen) usadas na fala. */
export function tokenizeSpoken(text: string): string[] {
  return text
    .split(/[\s/\-–—]+/)
    .map(normalizeWord)
    .filter(Boolean);
}

export function listScriptBlocks(programs: Program[]): ScriptBlockItem[] {
  const items: ScriptBlockItem[] = [];

  programs.forEach((program, programIndex) => {
    program.blocks.forEach((block, blockIndex) => {
      items.push({
        id: `${programIndex}-${blockIndex}`,
        title: block.program_name || program.name || "Programa sem nome",
        block: {
          ...block,
          pg_index: block.pg_index ?? "",
        },
      });
    });
  });

  return items;
}

export function flattenBlock(block: Block): PreparedScript {
  const lines: PromptLine[] = [];
  const scriptWords: string[] = [];
  let lineId = 0;

  for (const subblock of block.subblocks) {
    for (const text of subblock.lines) {
      const technical =
        subblock.type === "technical" || isCommandText(text);
      const displayWords = tokenizeDisplay(text);
      const words: PromptWord[] = displayWords.map((display) => {
        if (technical) {
          return {
            display,
            scriptIndex: null,
            scriptIndexEnd: null,
          };
        }

        const parts = display
          .split(/[/\-–—]+/)
          .map(normalizeWord)
          .filter(Boolean);

        if (parts.length === 0) {
          return {
            display,
            scriptIndex: null,
            scriptIndexEnd: null,
          };
        }

        const scriptIndex = scriptWords.length;
        for (const part of parts) {
          scriptWords.push(part);
        }

        return {
          display,
          scriptIndex,
          scriptIndexEnd: scriptIndex + parts.length,
        };
      });

      lines.push({
        id: lineId++,
        text,
        technical,
        words,
      });
    }
  }

  return { lines, scriptWords };
}
