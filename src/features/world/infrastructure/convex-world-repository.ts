"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Facing } from "@/features/scene/domain/world-layout";

/**
 * Adapter fino sobre as funções Convex do mapa único — isola o domínio
 * (`src/features/world`) do client Convex real, igual ao padrão usado em
 * outras features. Troca de backend futura só muda este arquivo.
 */
export function usePlayersQuery() {
  return useQuery(api.players.listPlayers);
}

export function useMyPlayerQuery() {
  return useQuery(api.players.getMyPlayer);
}

export function useCurrentUserQuery() {
  return useQuery(api.users.getCurrentUser);
}

export function useGlobalFocusStatsQuery() {
  return useQuery(api.stats.globalFocusCount);
}

export function useJoinWorldMutation() {
  return useMutation(api.players.joinWorld);
}

export function useUpdatePositionMutation() {
  return useMutation(api.players.updatePosition);
}

export function useSitDownMutation() {
  return useMutation(api.players.sitDown);
}

export function useStandUpMutation() {
  return useMutation(api.players.standUp);
}

export function useStartFocusMutation() {
  return useMutation(api.players.startFocus);
}

export function useStopFocusMutation() {
  return useMutation(api.players.stopFocus);
}

export type UpdatePositionArgs = {
  x: number;
  y: number;
  facing: Facing;
  zoneId?: string;
};
