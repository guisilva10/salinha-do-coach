"use client";

import { useEffect, useMemo, useRef } from "react";
import { getSpawnPosition, getZoneAt, pickSpriteVariant } from "@/features/scene/application/scene-helpers";
import { OFFICE_LAYOUT } from "@/features/scene/domain/layouts/office";
import type { WorldPlayer } from "../../domain/entities/world-player";
import {
  useCurrentUserQuery,
  useJoinWorldMutation,
  useMyPlayerQuery,
} from "../../infrastructure/convex-world-repository";

/**
 * Estado do jogador local: entra no mundo automaticamente na primeira vez
 * (spawn de `OFFICE_LAYOUT`), depois resume de onde ficou (`getMyPlayer`
 * já traz posição/assento/foco durável — não volta pro spawn a cada reload).
 */
export function useMe(): {
  me: WorldPlayer | undefined;
  userId: string | undefined;
  username: string | undefined;
} {
  const currentUser = useCurrentUserQuery();
  const myPlayer = useMyPlayerQuery();
  const joinWorld = useJoinWorldMutation();
  const hasRequestedJoinRef = useRef(false);

  useEffect(() => {
    if (hasRequestedJoinRef.current) return;
    if (currentUser === undefined || myPlayer === undefined) return;
    if (myPlayer !== null) return;

    hasRequestedJoinRef.current = true;
    const spawn = getSpawnPosition(OFFICE_LAYOUT);
    const spawnZone = getZoneAt(OFFICE_LAYOUT, OFFICE_LAYOUT.spawn);

    void joinWorld({
      x: spawn.x,
      y: spawn.y,
      zoneId: spawnZone?.id ?? OFFICE_LAYOUT.zones[0]?.id ?? "reception",
    });
  }, [currentUser, myPlayer, joinWorld]);

  const me = useMemo<WorldPlayer | undefined>(() => {
    if (!myPlayer) {
      return undefined;
    }
    return { ...myPlayer, spriteVariant: pickSpriteVariant(myPlayer.username) };
  }, [myPlayer]);

  return { me, userId: currentUser?._id, username: currentUser?.username };
}
