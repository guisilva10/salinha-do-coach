"use client";

import { useGlobalFocusStatsQuery } from "../../infrastructure/convex-world-repository";

export function useFocusStats() {
  const stats = useGlobalFocusStatsQuery();
  return { stats };
}
