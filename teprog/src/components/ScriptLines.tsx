import type { MatchingWord, VisualLine } from "../types/script";
import type { StyleConfig } from "../types/style";

type ScriptLinesProps = {
  lines: VisualLine[];
  matchingWords: MatchingWord[];
  style: StyleConfig;
  currentLineId: string | null;
  currentWordId: number | null;
  spokenWordIds: number[];
  fontScale?: number;
};

export function ScriptLines({
  lines,
  matchingWords,
  style,
  currentLineId,
  currentWordId,
  spokenWordIds,
  fontScale = 1,
}: ScriptLinesProps) {
  const wordsByLine = new Map<string, MatchingWord[]>();
  for (const word of matchingWords) {
    const list = wordsByLine.get(word.line_id) ?? [];
    list.push(word);
    wordsByLine.set(word.line_id, list);
  }

  const spoken = new Set(spokenWordIds);

  return (
    <div
      className="mx-auto w-full max-w-3xl px-6"
      style={{
        fontFamily: style.fontFamily || undefined,
        fontSize: `${Math.max(14, Math.round(style.fontSizePx * fontScale))}px`,
        textAlign: style.textAlign,
        color: style.colorNormal,
        lineHeight: 1.55,
      }}
    >
      {lines.map((line) => {
        const isTechnical = line.content.type === "technical";
        const words = wordsByLine.get(line.id) ?? [];

        return (
          <div
            key={line.id}
            data-line-id={line.id}
            data-lauda-id={line.lauda_id}
            className="py-1"
            style={
              isTechnical
                ? {
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    display: "inline-block",
                    padding: "0.1em 0.35em",
                    margin: "0.15em 0",
                    borderRadius: "2px",
                    fontWeight: 700,
                  }
                : undefined
            }
          >
            {isTechnical || words.length === 0 ? (
              <span>{line.content.text}</span>
            ) : (
              words.map((word, index) => {
                const isCurrent =
                  word.id === currentWordId ||
                  (currentLineId === line.id &&
                    currentWordId !== null &&
                    word.id === currentWordId);
                const isSpoken = spoken.has(word.id) && !isCurrent;
                return (
                  <span key={word.id}>
                    <span
                      data-word-id={word.id}
                      style={
                        isCurrent
                          ? {
                              backgroundColor: style.colorCurrent || undefined,
                              color: style.colorCurrentFg || undefined,
                            }
                          : isSpoken
                            ? {
                                color: style.colorSpoken,
                                opacity: 0.85,
                              }
                            : undefined
                      }
                    >
                      {word.word}
                    </span>
                    {index < words.length - 1 ? " " : null}
                  </span>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
