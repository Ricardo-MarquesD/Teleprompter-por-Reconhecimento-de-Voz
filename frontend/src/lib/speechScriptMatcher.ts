const PHRASE_WINDOW = 4;
const RECOVERY_SCORE = 3;
const DIVERGE_SCORE = 2; // score < 2 → improvisa; score === 2 → mantém

export type FollowState = {
  cursor: number;
  improvising: boolean;
};

export const INITIAL_FOLLOW_STATE: FollowState = {
  cursor: 0,
  improvising: false,
};

/** Quantas posições coincidem (ordem importa). */
export function positionalScore(a: string[], b: string[]): number {
  const n = Math.min(a.length, b.length);
  let score = 0;
  for (let i = 0; i < n; i++) {
    if (a[i] === b[i]) score += 1;
  }
  return score;
}

export function bestScriptWindow(
  scriptWords: string[],
  spoken4: string[],
  fromIndex: number,
): { index: number; score: number } {
  let best = { index: -1, score: -1 };

  if (spoken4.length < PHRASE_WINDOW || scriptWords.length < PHRASE_WINDOW) {
    return best;
  }

  const start = Math.max(0, fromIndex);
  const last = scriptWords.length - PHRASE_WINDOW;

  for (let i = start; i <= last; i++) {
    const window = scriptWords.slice(i, i + PHRASE_WINDOW);
    const score = positionalScore(spoken4, window);
    if (score > best.score) {
      best = { index: i, score };
    }
  }

  return best;
}

/**
 * Acompanha o roteiro com métrica de 4 palavras:
 * score >= 3 → no roteiro / recupera; score < 2 → improvisa; score === 2 → mantém.
 */
export function followSpokenScript(
  scriptWords: string[],
  spokenWords: string[],
  previous: FollowState = INITIAL_FOLLOW_STATE,
): FollowState {
  if (scriptWords.length === 0 || spokenWords.length === 0) {
    return previous;
  }

  let { cursor, improvising } = previous;

  // Com menos de 4 palavras: avanço simples sem togglear improviso.
  if (spokenWords.length < PHRASE_WINDOW) {
    const last = spokenWords[spokenWords.length - 1];
    if (!improvising && cursor < scriptWords.length && scriptWords[cursor] === last) {
      cursor += 1;
    } else if (
      !improvising &&
      cursor + 1 < scriptWords.length &&
      scriptWords[cursor + 1] === last
    ) {
      cursor += 2;
    }

    console.log("[follow]", { score: null, cursor, improvising, mode: "warmup" });
    return { cursor, improvising };
  }

  const spoken4 = spokenWords.slice(-PHRASE_WINDOW);
  const searchFrom = improvising ? 0 : Math.max(0, cursor - PHRASE_WINDOW);
  const { index, score } = bestScriptWindow(scriptWords, spoken4, searchFrom);

  if (score >= RECOVERY_SCORE && index >= 0) {
    cursor = index + PHRASE_WINDOW;
    improvising = false;
  } else if (score < DIVERGE_SCORE) {
    improvising = true;
  }
  // score === 2 → mantém cursor e improvising

  console.log("[follow]", { score, windowIndex: index, cursor, improvising });
  return { cursor, improvising };
}
