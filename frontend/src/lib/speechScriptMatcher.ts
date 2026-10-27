const PHRASE_WINDOW = 4;
const LOOKAHEAD = 2;

export type FollowState = {
  cursor: number;
  improvising: boolean;
  /** Quantas palavras faladas já foram consumidas pelo cursor. */
  spokenIndex: number;
};

export const INITIAL_FOLLOW_STATE: FollowState = {
  cursor: 0,
  improvising: false,
  spokenIndex: 0,
};

export function indexOfSequence(
  haystack: string[],
  needle: string[],
  from = 0,
): number {
  if (needle.length === 0 || haystack.length < needle.length) {
    return -1;
  }

  outer: for (let i = from; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        continue outer;
      }
    }
    return i;
  }

  return -1;
}

/**
 * Avança o cursor palavra a palavra.
 * Se 4 palavras seguidas divergirem do roteiro → interpretação.
 * Volta ao roteiro quando uma sequência de 4 palavras bater de novo.
 */
export function followSpokenScript(
  scriptWords: string[],
  spokenWords: string[],
  previous: FollowState = INITIAL_FOLLOW_STATE,
): FollowState {
  if (scriptWords.length === 0) {
    return previous;
  }

  if (spokenWords.length === 0) {
    return previous;
  }

  let { cursor, improvising } = previous;
  let spokenIndex = previous.spokenIndex;

  // Reinício do STT pode encolher a lista; realinha o índice.
  if (spokenIndex > spokenWords.length) {
    spokenIndex = Math.max(0, spokenWords.length - PHRASE_WINDOW);
  }

  if (improvising) {
    if (spokenWords.length < PHRASE_WINDOW) {
      return { cursor, improvising: true, spokenIndex: spokenWords.length };
    }

    const phrase = spokenWords.slice(-PHRASE_WINDOW);
    const recovered = indexOfSequence(scriptWords, phrase, 0);
    if (recovered >= 0) {
      return {
        cursor: recovered + phrase.length,
        improvising: false,
        spokenIndex: spokenWords.length,
      };
    }

    return {
      cursor,
      improvising: true,
      spokenIndex: spokenWords.length,
    };
  }

  let missStreak = 0;

  while (spokenIndex < spokenWords.length && cursor < scriptWords.length) {
    const word = spokenWords[spokenIndex];
    let matched = false;

    for (let skip = 0; skip <= LOOKAHEAD; skip++) {
      const target = cursor + skip;
      if (target >= scriptWords.length) break;
      if (scriptWords[target] === word) {
        cursor = target + 1;
        matched = true;
        missStreak = 0;
        break;
      }
    }

    spokenIndex += 1;

    if (!matched) {
      missStreak += 1;
      if (missStreak >= PHRASE_WINDOW) {
        const phrase = spokenWords.slice(
          Math.max(0, spokenIndex - PHRASE_WINDOW),
          spokenIndex,
        );
        const near = indexOfSequence(
          scriptWords,
          phrase,
          Math.max(0, cursor - PHRASE_WINDOW),
        );
        if (near >= 0) {
          cursor = near + phrase.length;
          missStreak = 0;
          continue;
        }

        const anywhere = indexOfSequence(scriptWords, phrase, 0);
        if (anywhere >= 0) {
          cursor = anywhere + phrase.length;
          missStreak = 0;
          continue;
        }

        return {
          cursor,
          improvising: true,
          spokenIndex,
        };
      }
    }
  }

  return {
    cursor,
    improvising: false,
    spokenIndex,
  };
}
