"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LiveDot } from "@/shared/ui/live-dot";

/**
 * Contador global de FOMO honesto (docs/DESIGN_DIRECTION.md seção 9, bloco 2).
 * Fonte real: api.stats.globalFocusCount -> { liveCount, weeklyTotal }.
 * Regra: nunca fabrica número. Enquanto a query não responde, mostra skeleton.
 * liveCount > 0 é o protagonista; liveCount === 0 dá lugar ao cumulativo da
 * semana, e o live count vira convite ("seja a próxima"), nunca vergonha de
 * estar vazio.
 */
export function LiveFocusCounter() {
  const stats = useQuery(api.stats.globalFocusCount);

  if (stats === undefined) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="h-10 w-44 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      </div>
    );
  }

  if (stats.liveCount > 0) {
    return (
      <div className="flex flex-col items-center gap-1 text-center" aria-live="polite">
        <p className="flex items-center gap-2 text-4xl font-extrabold tabular-nums sm:text-5xl">
          <LiveDot />
          {stats.liveCount}
        </p>
        <p className="text-sm text-muted-foreground">pessoas focando agora</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 text-center" aria-live="polite">
      <p className="text-4xl font-extrabold tabular-nums sm:text-5xl">{stats.weeklyTotal}</p>
      <p className="text-sm text-muted-foreground">sessões de foco abertas essa semana</p>
      <p className="mt-2 text-xs text-muted-foreground/80">
        0 pessoas focando neste minuto exato — seja a próxima.
      </p>
    </div>
  );
}
