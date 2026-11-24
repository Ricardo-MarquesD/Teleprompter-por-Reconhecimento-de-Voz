import { emit, listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { AppState } from "../store/appStore";

export const STATE_EVENT = "teprog://state";
export const OPERATOR_SCROLL_EVENT = "teprog://operator-scroll";
export const REQUEST_STATE_EVENT = "teprog://request-state";

export type SyncStatePayload = Pick<
  AppState,
  | "script"
  | "style"
  | "operatorMode"
  | "captureStatus"
  | "currentLineId"
  | "currentWordId"
  | "spokenWordIds"
  | "activeLaudaId"
  | "trackingState"
  | "operatorScrollTop"
  | "operatorDetached"
  | "onAirDetached"
>;

export type OperatorScrollPayload = {
  scrollTop: number;
  lineId: string | null;
};

export function toSyncPayload(state: AppState): SyncStatePayload {
  return {
    script: state.script,
    style: state.style,
    operatorMode: state.operatorMode,
    captureStatus: state.captureStatus,
    currentLineId: state.currentLineId,
    currentWordId: state.currentWordId,
    spokenWordIds: state.spokenWordIds,
    activeLaudaId: state.activeLaudaId,
    trackingState: state.trackingState,
    operatorScrollTop: state.operatorScrollTop,
    operatorDetached: state.operatorDetached,
    onAirDetached: state.onAirDetached,
  };
}

export async function broadcastState(state: AppState): Promise<void> {
  await emit(STATE_EVENT, toSyncPayload(state));
}

export async function broadcastOperatorScroll(
  payload: OperatorScrollPayload,
): Promise<void> {
  await emit(OPERATOR_SCROLL_EVENT, payload);
}

export async function requestState(): Promise<void> {
  await emit(REQUEST_STATE_EVENT, {});
}

export async function onState(
  handler: (payload: SyncStatePayload) => void,
): Promise<UnlistenFn> {
  return listen<SyncStatePayload>(STATE_EVENT, (event) => handler(event.payload));
}

export async function onOperatorScroll(
  handler: (payload: OperatorScrollPayload) => void,
): Promise<UnlistenFn> {
  return listen<OperatorScrollPayload>(OPERATOR_SCROLL_EVENT, (event) =>
    handler(event.payload),
  );
}

export async function onRequestState(
  handler: () => void,
): Promise<UnlistenFn> {
  return listen(REQUEST_STATE_EVENT, () => handler());
}
