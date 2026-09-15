"use client";

import "./pixi-setup";
import { useTick } from "@pixi/react";
import { useRef } from "react";
import type { Container, Ticker } from "pixi.js";
import { getSeatById } from "../application/scene-helpers";
import type { Player, WorldLayout } from "../domain/world-layout";
import { actorZIndex, getSeatedPoint } from "./actor-placement";
import { CharacterActor } from "./character-actor";
import type { ScenePalette } from "./scene-theme";
import type { SceneTextures } from "./use-scene-textures";

type RemotePlayerProps = {
  layout: WorldLayout;
  player: Player;
  textures: SceneTextures;
  palette: ScenePalette;
  animate: boolean;
  /** Ticker stopped (previews): snap to the target through props. */
  isStatic?: boolean;
};

/** Per-second fraction of the remaining distance covered (exponential smoothing). */
const LERP_RATE = 12;
/** Beyond this many tiles the player teleports instead of sliding. */
const SNAP_DISTANCE_TILES = 4;
const MOVING_EPSILON = 0.5;

/** Another user's character: eases toward the last received position; seated players snap to the chair. */
export function RemotePlayer({ layout, player, textures, palette, animate, isStatic = false }: RemotePlayerProps) {
  const containerRef = useRef<Container>(null);
  const currentRef = useRef({ x: player.x, y: player.y });
  const movingRef = useRef(false);
  const seat = getSeatById(layout, player.seatId);
  const target = seat ? getSeatedPoint(layout, seat) : { x: player.x, y: player.y };
  const staticPosition = isStatic
    ? { x: Math.round(target.x), y: Math.round(target.y), zIndex: actorZIndex(target.y) }
    : undefined;

  useTick((ticker: Ticker) => {
    const container = containerRef.current;
    if (!container) return;
    const current = currentRef.current;
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.hypot(dx, dy);
    if (seat || distance > SNAP_DISTANCE_TILES * layout.tileSize || distance < MOVING_EPSILON) {
      currentRef.current = { x: target.x, y: target.y };
      movingRef.current = false;
    } else {
      const t = Math.min(1, (ticker.deltaMS / 1000) * LERP_RATE);
      currentRef.current = { x: current.x + dx * t, y: current.y + dy * t };
      movingRef.current = true;
    }
    container.position.set(Math.round(currentRef.current.x), Math.round(currentRef.current.y));
    container.zIndex = actorZIndex(currentRef.current.y);
  });

  return (
    <CharacterActor
      ref={containerRef}
      player={player}
      textures={textures}
      palette={palette}
      seatKind={seat?.kind ?? null}
      movingRef={movingRef}
      animate={animate}
      staticPosition={staticPosition}
    />
  );
}
