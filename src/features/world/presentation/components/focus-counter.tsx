"use client";

import { useFocusStats } from "../hooks/use-focus-stats";
import { LiveDot } from "@/shared/ui/live-dot";

/** Contador honesto "X focando agora" — mesma fonte da landing page. */
export function FocusCounter() {
  const { stats } = useFocusStats();

  if (stats === undefined) {
    return (
      <div className="h-5 w-32 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
    );
  }

  if (stats.liveCount > 0) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium tabular-nums" aria-live="polite">
        <LiveDot />
        {stats.liveCount} focando agora
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      {stats.weeklyTotal} sessões essa semana
    </p>
  );
}
