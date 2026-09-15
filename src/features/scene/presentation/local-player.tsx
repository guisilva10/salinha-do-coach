"use client";

import "./pixi-setup";
import { useTick } from "@pixi/react";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Container, Ticker } from "pixi.js";
import { computeCamera } from "../application/camera";
import type { Size } from "../application/camera";
import { facingFromDirection, isIdle, isSamePosition, roundPosition, stepPosition } from "../application/movement";
import { getStandTile, pixelToTile, tileToPixel } from "../application/scene-helpers";
import type { Player, Seat, TilePosition, WorldLayout, WorldPosition } from "../domain/world-layout";
import { actorZIndex, getSeatedPoint } from "./actor-placement";
import { CharacterActor } from "./character-actor";
import type { ScenePalette } from "./scene-theme";
import { readDirection } from "./use-movement-input";
import type { MovementInputRef } from "./use-movement-input";
import type { SceneTextures } from "./use-scene-textures";

type LocalPlayerProps = {
  layout: WorldLayout;
  player: Player;
  seat: Seat | undefined;
  textures: SceneTextures;
  palette: ScenePalette;
  inputRef: MovementInputRef;
  cameraRef: RefObject<Container | null>;
  viewport: Size;
  scale: number;
  /** Screen px covered by on-screen controls at the bottom; the camera centers above them. */
  cameraBottomInset: number;
  animate: boolean;
  onMove: (position: WorldPosition) => void;
  onStand: () => void;
  onTileChange: (tile: TilePosition) => void;
};

const SEND_INTERVAL_MS = 100;
const MAX_FRAME_SECONDS = 0.1;

function applyCamera(
  cameraRef: RefObject<Container | null>,
  target: { x: number; y: number },
  viewport: Size,
  world: Size,
  scale: number,
  bottomInset: number,
) {
  const camera = cameraRef.current;
  if (!camera) return;
  const position = computeCamera(target, viewport, world, scale, bottomInset);
  camera.position.set(position.x, position.y);
}

/**
 * The controlled character. Owns its position in a ref (authoritative on this client),
 * moves the camera and reports position changes at most every 100ms.
 */
export function LocalPlayer({
  layout,
  player,
  seat,
  textures,
  palette,
  inputRef,
  cameraRef,
  viewport,
  scale,
  cameraBottomInset,
  animate,
  onMove,
  onStand,
  onTileChange,
}: LocalPlayerProps) {
  const containerRef = useRef<Container>(null);
  const positionRef = useRef<WorldPosition>({ x: player.x, y: player.y, facing: player.facing });
  const lastSentRef = useRef<WorldPosition>({ x: player.x, y: player.y, facing: player.facing });
  const lastTileRef = useRef<TilePosition | null>(null);
  const sendTimerRef = useRef(0);
  const movingRef = useRef(false);
  const hasRequestedStandRef = useRef(false);

  useEffect(() => {
    onTileChange(pixelToTile(positionRef.current.x, positionRef.current.y, layout.tileSize));
  }, [layout.tileSize, onTileChange]);

  // `seat` some (levantou) — libera o guard pra um próximo gesto de levantar futuro.
  useEffect(() => {
    if (!seat) {
      hasRequestedStandRef.current = false;
    }
  }, [seat]);

  useTick((ticker: Ticker) => {
    const container = containerRef.current;
    if (!container) return;
    const direction = readDirection(inputRef.current);
    const world = { width: layout.cols * layout.tileSize, height: layout.rows * layout.tileSize };

    if (seat) {
      if (isIdle(direction)) {
        const point = getSeatedPoint(layout, seat);
        container.position.set(point.x, point.y);
        container.zIndex = actorZIndex(point.y);
        movingRef.current = false;
        applyCamera(cameraRef, point, viewport, world, scale, cameraBottomInset);
        return;
      }
      const standTile = getStandTile(layout, seat);
      const standPoint = tileToPixel(standTile.col, standTile.row, layout.tileSize);
      positionRef.current = { ...standPoint, facing: facingFromDirection(direction, seat.facing) };
      lastSentRef.current = positionRef.current;
      if (!hasRequestedStandRef.current) {
        hasRequestedStandRef.current = true;
        onStand();
      }
      onMove(roundPosition(positionRef.current));
    }

    const dt = Math.min(ticker.deltaMS / 1000, MAX_FRAME_SECONDS);
    const next = stepPosition(layout, positionRef.current, direction, dt);
    movingRef.current = next.x !== positionRef.current.x || next.y !== positionRef.current.y;
    positionRef.current = next;

    container.position.set(Math.round(next.x), Math.round(next.y));
    container.zIndex = actorZIndex(next.y);
    applyCamera(cameraRef, next, viewport, world, scale, cameraBottomInset);

    const tile = pixelToTile(next.x, next.y, layout.tileSize);
    const lastTile = lastTileRef.current;
    if (!lastTile || lastTile.col !== tile.col || lastTile.row !== tile.row) {
      lastTileRef.current = tile;
      onTileChange(tile);
    }

    sendTimerRef.current += ticker.deltaMS;
    if (sendTimerRef.current >= SEND_INTERVAL_MS && !isSamePosition(next, lastSentRef.current)) {
      sendTimerRef.current = 0;
      lastSentRef.current = next;
      onMove(roundPosition(next));
    }
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
    />
  );
}
