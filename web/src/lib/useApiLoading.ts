"use client";

import { useSyncExternalStore } from "react";
import { subscribeApiLoading, getApiLoadingSnapshot } from "./api-client";

/** True whenever at least one api-client request is in flight. */
export function useApiLoading(): boolean {
  return useSyncExternalStore(subscribeApiLoading, getApiLoadingSnapshot, () => false);
}
