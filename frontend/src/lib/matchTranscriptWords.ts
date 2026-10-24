export function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeNormalized(value: string): string[] {
  const normalized = normalizeForMatch(value);
  return normalized ? normalized.split(" ") : [];
}

/**
 * Greedy match: from startFrom, consume speakable script words that appear
 * in order within the normalized transcript tokens.
 */
export function matchTranscriptToWords(
  speakableWords: string[],
  transcript: string,
  startFrom = 0,
): number {
  if (speakableWords.length === 0 || !transcript.trim()) {
    return startFrom;
  }

  const transcriptTokens = tokenizeNormalized(transcript);
  if (transcriptTokens.length === 0) {
    return startFrom;
  }

  let scriptIndex = startFrom;
  let transcriptIndex = 0;

  while (
    scriptIndex < speakableWords.length &&
    transcriptIndex < transcriptTokens.length
  ) {
    const expected = normalizeForMatch(speakableWords[scriptIndex] ?? "");
    if (!expected) {
      scriptIndex += 1;
      continue;
    }

    let found = -1;
    for (
      let i = transcriptIndex;
      i < transcriptTokens.length;
      i += 1
    ) {
      if (transcriptTokens[i] === expected) {
        found = i;
        break;
      }
    }

    if (found === -1) {
      break;
    }

    scriptIndex += 1;
    transcriptIndex = found + 1;
  }

  return scriptIndex;
}
