"use client";

import { useCallback, useEffect, useRef } from "react";
import usePresence from "@convex-dev/presence/react";
import { getZoneAt, pixelToTile } from "@/features/scene/application/scene-helpers";
import { OFFICE_LAYOUT } from "@/features/scene/domain/layouts/office";
import type { Facing } from "@/features/scene/domain/world-layout";
import { api } from "../../../../../convex/_generated/api";
import {
  useSitDownMutation,
  useStandUpMutation,
  useStartFocusMutation,
  useStopFocusMutation,
  useUpdatePositionMutation,
} from "../../infrastructure/convex-world-repository";

const OFFICE_ROOM = "office";
const POSITION_THROTTLE_MS = 120;
const HEARTBEAT_INTERVAL_MS = 10_000;

type Position = { x: number; y: number; facing: Facing };

/**
 * Ações do mundo — heartbeat de presence (sala fixa "office") + mutations
 * throttled. Só monte o componente que chama este hook depois que `userId`
 * for garantido (não chame condicionalmente — regra dos hooks).
 */
export function useWorldActions(userId: string) {
  usePresence(api.presence, OFFICE_ROOM, userId, HEARTBEAT_INTERVAL_MS);

  const updatePosition = useUpdatePositionMutation();
  const sitDownMutation = useSitDownMutation();
  const standUpMutation = useStandUpMutation();
  const startFocusMutation = useStartFocusMutation();
  const stopFocusMutation = useStopFocusMutation();

  const lastZoneIdRef = useRef<string | undefined>(undefined);
  const lastSentAtRef = useRef(0);
  const pendingRef = useRef<Position | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) {
      return;
    }
    pendingRef.current = null;

    const tile = pixelToTile(pending.x, pending.y, OFFICE_LAYOUT.tileSize);
    const zone = getZoneAt(OFFICE_LAYOUT, tile);
    const zoneChanged = zone !== undefined && zone.id !== lastZoneIdRef.current;
    if (zoneChanged) {
      lastZoneIdRef.current = zone.id;
    }

    void updatePosition({
      x: pending.x,
      y: pending.y,
      facing: pending.facing,
      ...(zoneChanged ? { zoneId: zone.id } : {}),
    });
  }, [updatePosition]);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const move = useCallback(
    (position: Position) => {
      pendingRef.current = position;
      const now = Date.now();
      const elapsed = now - lastSentAtRef.current;

      if (elapsed >= POSITION_THROTTLE_MS) {
        lastSentAtRef.current = now;
        flush();
        return;
      }

      if (timeoutRef.current === null) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          lastSentAtRef.current = Date.now();
          flush();
        }, POSITION_THROTTLE_MS - elapsed);
      }
    },
    [flush],
  );

  // zoneId é derivado do assento no servidor (convex/players.ts sitDown).
  const sit = useCallback(
    (seatId: string) => sitDownMutation({ seatId }),
    [sitDownMutation],
  );

  const stand = useCallback(() => standUpMutation({}), [standUpMutation]);

  const startFocus = useCallback(
    (goal: string | undefined, minutes: number) => startFocusMutation({ goal, minutes }),
    [startFocusMutation],
  );

  const stopFocus = useCallback(() => stopFocusMutation({}), [stopFocusMutation]);

  return { move, sit, stand, startFocus, stopFocus };
}
