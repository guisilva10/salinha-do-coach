"use client";

import { useEffect, useRef } from "react";
import { useConvexConnectionState } from "convex/react";
import { toast } from "sonner";
import type { WorldPlayer } from "../../domain/entities/world-player";

const TOAST_DURATION_MS = 3500;
const RECONNECT_GRACE_MS = 4000;

/**
 * Deriva o feed de eventos ("entrou", "saiu", "começou N min de foco")
 * comparando snapshots consecutivos de `listPlayers` — sem novo endpoint.
 * Sem som (regra do produto).
 *
 * Duas salvaguardas contra falso-positivo em massa:
 * 1. Ignora o primeiro snapshot (nunca compara contra um `previous` vazio).
 * 2. Ignora qualquer diff nos ~4s após o client Convex (re)conectar
 *    (`useConvexConnectionState().connectionCount` mudou) — uma reconexão
 *    reenvia o snapshot completo de presence e pareceria todo mundo
 *    "entrando"/"saindo" de novo sem ter saído de fato.
 */
export function useEventFeed(players: WorldPlayer[] | undefined) {
  const previousRef = useRef<Map<string, WorldPlayer>>(new Map());
  const isFirstRunRef = useRef(true);
  // 0 (não `Date.now()`) — inicializar com hora atual seria chamada impura
  // durante o render; o primeiro efeito abaixo seta a janela real no mount.
  const graceUntilRef = useRef(0);

  const { connectionCount } = useConvexConnectionState();
  const lastConnectionCountRef = useRef(connectionCount);

  useEffect(() => {
    if (connectionCount !== lastConnectionCountRef.current) {
      lastConnectionCountRef.current = connectionCount;
      graceUntilRef.current = Date.now() + RECONNECT_GRACE_MS;
    }
  }, [connectionCount]);

  useEffect(() => {
    if (players === undefined) {
      return;
    }

    const current = new Map(players.map((player) => [player.userId, player]));

    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      previousRef.current = current;
      graceUntilRef.current = Date.now() + RECONNECT_GRACE_MS;
      return;
    }

    if (Date.now() < graceUntilRef.current) {
      previousRef.current = current;
      return;
    }

    const previous = previousRef.current;

    for (const [userId, player] of current) {
      const before = previous.get(userId);

      if (!before) {
        toast(`${player.username} entrou no foco`, { duration: TOAST_DURATION_MS });
        continue;
      }

      if (before.focusUntil === undefined && player.focusUntil !== undefined) {
        const minutes = Math.max(1, Math.round((player.focusUntil - Date.now()) / 60_000));
        toast(`${player.username} começou ${minutes} min de foco`, {
          duration: TOAST_DURATION_MS,
        });
      }
    }

    for (const [userId, player] of previous) {
      if (!current.has(userId)) {
        toast(`${player.username} saiu`, { duration: TOAST_DURATION_MS });
      }
    }

    previousRef.current = current;
  }, [players]);
}
