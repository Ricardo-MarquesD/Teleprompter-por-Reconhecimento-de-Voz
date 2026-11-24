import { useSyncExternalStore } from "react";
import { getAppState, subscribeAppStore, type AppState } from "../store/appStore";

export function useAppStore(): AppState {
  return useSyncExternalStore(subscribeAppStore, getAppState, getAppState);
}
