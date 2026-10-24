import type { TeleprompterLine as Line } from "../../types/teleprompter";

type TeleprompterLineProps = {
  line: Line;
  matchedWordCount: number;
};

export function TeleprompterLine({
  line,
  matchedWordCount,
}: TeleprompterLineProps) {
  return (
    <p className="mb-4 text-2xl leading-relaxed font-medium">
      {line.segments.map((segment, index) => {
        if (segment.kind === "technical") {
          return (
            <span
              key={`${line.id}-t-${index}`}
              className="mx-0.5 inline-block rounded-sm bg-white px-1.5 py-0.5 text-w_font"
            >
              {segment.text}
            </span>
          );
        }

        const wordIndex = segment.wordIndex ?? -1;
        const isMatched = wordIndex >= 0 && wordIndex < matchedWordCount;
        const isActive = wordIndex === matchedWordCount - 1;

        return (
          <span
            key={`${line.id}-w-${index}`}
            data-word-index={wordIndex}
            className={`mr-1.5 inline-block rounded-sm px-0.5 ${
              isActive
                ? "bg-yellow-400/90 text-w_font"
                : isMatched
                  ? "opacity-50"
                  : ""
            }`}
          >
            {segment.text}
          </span>
        );
      })}
    </p>
  );
}
