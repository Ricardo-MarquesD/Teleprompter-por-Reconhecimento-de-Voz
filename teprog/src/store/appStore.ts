import type { SlugScript } from "../types/script";
import type { StyleConfig } from "../types/style";
import { DEFAULT_STYLE } from "../types/style";
import type { ProcessBootstrap } from "../types/messages";

export type CaptureStatus = "idle" | "starting" | "listening" | "error";

export type AppState = {
  script: SlugScript | null;
  style: StyleConfig;
  slugBoot: ProcessBootstrap | null;
  tpBoot: ProcessBootstrap | null;
  servicesReady: boolean;
  operatorMode: boolean;
  captureStatus: CaptureStatus;
  captureError: string | null;
  currentLineId: string | null;
  currentWordId: number | null;
  spokenWordIds: number[];
  activeLaudaId: string | null;
  trackingState: "tracking" | "improvising" | null;
  operatorScrollTop: number;
  operatorDetached: boolean;
  onAirDetached: boolean;
  statusMessage: string | null;
};

const listeners = new Set<() => void>();

let state: AppState = {
  script: null,
  style: { ...DEFAULT_STYLE },
  slugBoot: null,
  tpBoot: null,
  servicesReady: false,
  operatorMode: false,
  captureStatus: "idle",
  captureError: null,
  currentLineId: null,
  currentWordId: null,
  spokenWordIds: [],
  activeLaudaId: null,
  trackingState: null,
  operatorScrollTop: 0,
  operatorDetached: false,
  onAirDetached: false,
  statusMessage: null,
};

export function getAppState(): AppState {
  return state;
}

export function subscribeAppStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function patchAppState(partial: Partial<AppState>): void {
  state = { ...state, ...partial };
  emit();
}

export function setSpokenUpTo(wordId: number): void {
  const next = new Set(state.spokenWordIds);
  for (let i = 0; i <= wordId; i += 1) next.add(i);
  state = {
    ...state,
    spokenWordIds: [...next].sort((a, b) => a - b),
    currentWordId: wordId,
  };
  emit();
}

export function resetFollowProgress(): void {
  state = {
    ...state,
    currentLineId: null,
    currentWordId: null,
    spokenWordIds: [],
    trackingState: null,
  };
  emit();
}
