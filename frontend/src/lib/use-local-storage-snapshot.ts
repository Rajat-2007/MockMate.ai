"use client";

import { useSyncExternalStore } from "react";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useLocalStorageSnapshot(key: string) {
  return useSyncExternalStore(
    subscribeToStorage,
    () => window.localStorage.getItem(key),
    () => undefined,
  );
}
