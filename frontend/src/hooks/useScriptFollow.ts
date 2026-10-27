import { useEffect, useMemo, useState } from "react";
import {
  flattenBlock,
  tokenizeSpoken,
  type PromptLine,
} from "../lib/scriptModel";
import {
  followSpokenScript,
  INITIAL_FOLLOW_STATE,
  type FollowState,
} from "../lib/speechScriptMatcher";
import type { Block } from "../service/api";

export function useScriptFollow(
  block: Block | null,
  transcript: string,
): FollowState & { scriptWords: string[]; lines: PromptLine[] } {
  const prepared = useMemo(
    () => (block ? flattenBlock(block) : { lines: [], scriptWords: [] }),
    [block],
  );

  const [follow, setFollow] = useState<FollowState>(INITIAL_FOLLOW_STATE);

  useEffect(() => {
    setFollow(INITIAL_FOLLOW_STATE);
  }, [block]);

  useEffect(() => {
    if (!transcript.trim()) {
      setFollow(INITIAL_FOLLOW_STATE);
      return;
    }

    const spoken = tokenizeSpoken(transcript);
    setFollow((previous) =>
      followSpokenScript(prepared.scriptWords, spoken, previous),
    );
  }, [prepared.scriptWords, transcript]);

  return {
    ...follow,
    scriptWords: prepared.scriptWords,
    lines: prepared.lines,
  };
}
