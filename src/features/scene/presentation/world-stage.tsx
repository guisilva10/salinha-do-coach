"use client";

import "./pixi-setup";
import { useApplication } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import type { Container, Graphics } from "pixi.js";
import { computeCamera } from "../application/camera";
import type { Size } from "../application/camera";
import { findAdjacentSeat, getSeatById, getSeatOccupancy } from "../application/scene-helpers";
import type { Player, Seat, SceneTheme, TilePosition, WorldLayout, WorldPosition } from "../domain/world-layout";
import { FurnitureLayer } from "./furniture-layer";
import { LightsLayer, SeatPropsLayer } from "./lights-layer";
import { LocalPlayer } from "./local-player";
import { RemotePlayer } from "./remote-player";
import { SCENE_PALETTE } from "./scene-theme";
import { SeatSprite } from "./seat-sprite";
import { TileLayer } from "./tile-layer";
import type { MovementInputRef } from "./use-movement-input";
import { useSceneTextures } from "./use-scene-textures";

export type WorldStageProps = {
  layout: WorldLayout;
  players: Player[];
  /** Controlled user; omit for a spectator/preview stage (camera centered, no input). */
  meId?: string;
  theme: SceneTheme;
  viewport: Size;
  scale: number;
  /** Screen px covered by on-screen controls at the bottom (camera centers above them). */
  cameraBottomInset?: number;
  interactive: boolean;
  animate: boolean;
  /** Stopped ticker (previews): draw once after every React commit. */
  renderOnDemand?: boolean;
  inputRef?: MovementInputRef;
  onMove?: (position: WorldPosition) => void;
  onSit?: (seatId: string) => void;
  onStand?: () => void;
  onReachableSeatChange?: (seat: Seat | null) => void;
  onReady?: () => void;
  onError?: () => void;
};

function RenderOnDemand() {
  const { app } = useApplication();
  useEffect(() => {
    if (app.renderer) app.render();
  });
  return null;
}

export function WorldStage({
  layout,
  players,
  meId,
  theme,
  viewport,
  scale,
  cameraBottomInset = 0,
  interactive,
  animate,
  renderOnDemand = false,
  inputRef,
  onMove,
  onSit,
  onStand,
  onReachableSeatChange,
  onReady,
  onError,
}: WorldStageProps) {
  const { status, textures } = useSceneTextures();
  const cameraRef = useRef<Container>(null);
  const [meTile, setMeTile] = useState<TilePosition | null>(null);

  const palette = SCENE_PALETTE[theme];
  const occupancy = getSeatOccupancy(players);
  const me = players.find((player) => player.userId === meId);
  const meSeat = me ? getSeatById(layout, me.seatId) : undefined;
  const hasLocalPlayer = me !== undefined && inputRef !== undefined && interactive;
  const reachableSeat = hasLocalPlayer && !meSeat && meTile ? findAdjacentSeat(layout, meTile, players) : undefined;
  const reachableSeatId = reachableSeat?.id ?? null;

  useEffect(() => {
    if (status === "ready") onReady?.();
    if (status === "error") onError?.();
  }, [status, onReady, onError]);

  useEffect(() => {
    onReachableSeatChange?.(reachableSeat ?? null);
  }, [reachableSeatId, reachableSeat, onReachableSeatChange]);

  if (!textures) return null;

  const { tileSize } = layout;
  const world = { width: layout.cols * tileSize, height: layout.rows * tileSize };
  const centeredCamera = computeCamera({ x: world.width / 2, y: world.height / 2 }, viewport, world, scale);
  const cameraProps = hasLocalPlayer ? {} : centeredCamera;

  const drawGround = (graphics: Graphics) => {
    graphics.clear();
    graphics.rect(0, 0, world.width, world.height).fill(palette.groundColor);
  };

  const handleSeatSelect = (seatId: string) => {
    if (seatId === reachableSeatId) onSit?.(seatId);
  };

  return (
    <>
      <pixiContainer ref={cameraRef} scale={scale} {...cameraProps}>
        <pixiGraphics draw={drawGround} />
        <TileLayer grid={layout.layers.floor} tileSize={tileSize} textures={textures} tint={palette.dimTint} />
        <TileLayer grid={layout.layers.walls} tileSize={tileSize} textures={textures} tint={palette.dimTint} />
        <FurnitureLayer items={layout.layers.furniture} tileSize={tileSize} textures={textures} tint={palette.dimTint} />
        <SeatPropsLayer layout={layout} textures={textures} palette={palette} occupancy={occupancy} />
        <LightsLayer layout={layout} textures={textures} palette={palette} occupancy={occupancy} animate={animate} />
        <pixiContainer sortableChildren>
          {layout.seats.map((seat) => (
            <SeatSprite
              key={seat.id}
              seat={seat}
              tileSize={tileSize}
              textures={textures}
              palette={palette}
              occupant={occupancy.get(seat.id)}
              isReachable={seat.id === reachableSeatId}
              interactive={hasLocalPlayer}
              onSelect={handleSeatSelect}
            />
          ))}
          {players.map((player) =>
            hasLocalPlayer && player.userId === meId ? (
              <LocalPlayer
                key={player.userId}
                layout={layout}
                player={player}
                seat={meSeat}
                textures={textures}
                palette={palette}
                inputRef={inputRef}
                cameraRef={cameraRef}
                viewport={viewport}
                scale={scale}
                cameraBottomInset={cameraBottomInset}
                animate={animate}
                onMove={onMove ?? noop}
                onStand={onStand ?? noop}
                onTileChange={setMeTile}
              />
            ) : (
              <RemotePlayer
                key={player.userId}
                layout={layout}
                player={player}
                textures={textures}
                palette={palette}
                animate={animate}
                isStatic={renderOnDemand}
              />
            ),
          )}
        </pixiContainer>
      </pixiContainer>
      {renderOnDemand && <RenderOnDemand />}
    </>
  );
}

function noop() {}
