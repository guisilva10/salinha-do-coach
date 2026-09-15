"use client";

import { useMemo } from "react";
import { pickSpriteVariant } from "@/features/scene/application/scene-helpers";
import type { WorldPlayer } from "../../domain/entities/world-player";
import { usePlayersQuery } from "../../infrastructure/convex-world-repository";

/** Todos os players online agora, no shape `Player` esperado por `WorldScene` (+ zoneId). */
export function usePlayers(): { players: WorldPlayer[] | undefined } {
  const raw = usePlayersQuery();

  const players = useMemo<WorldPlayer[] | undefined>(() => {
    if (raw === undefined) {
      return undefined;
    }

    return raw.map((player) => ({
      ...player,
      spriteVariant: pickSpriteVariant(player.username),
    }));
  }, [raw]);

  return { players };
}
