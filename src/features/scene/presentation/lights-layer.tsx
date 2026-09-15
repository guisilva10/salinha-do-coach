"use client";

import "./pixi-setup";
import { useTick } from "@pixi/react";
import { useRef } from "react";
import type { Container, Ticker } from "pixi.js";
import { tileToPixel } from "../application/scene-helpers";
import { SEAT_PROP_BY_KIND } from "../domain/tile-atlas";
import type { Facing, Player, Seat, WorldLayout } from "../domain/world-layout";
import { LIT_TINT } from "./scene-theme";
import type { ScenePalette } from "./scene-theme";
import type { SceneTextures } from "./use-scene-textures";

const FACING_OFFSET: Record<Facing, { col: number; row: number }> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

/** Tile in front of the chair — where the desk prop (lamp / hourglass / headphones) sits. */
export function getSeatPropTile(seat: Seat): { col: number; row: number } {
  const offset = FACING_OFFSET[seat.facing];
  return { col: seat.col + offset.col, row: seat.row + offset.row };
}

type LayerProps = {
  layout: WorldLayout;
  textures: SceneTextures;
  palette: ScenePalette;
  occupancy: Map<string, Player>;
};

/** Desk prop per seat, lit (full color) when someone sits there. */
export function SeatPropsLayer({ layout, textures, palette, occupancy }: LayerProps) {
  const { tileSize } = layout;
  return (
    <pixiContainer>
      {layout.seats.map((seat) => {
        const tile = getSeatPropTile(seat);
        return (
          <pixiSprite
            key={seat.id}
            texture={textures.tile(SEAT_PROP_BY_KIND[seat.kind])}
            x={tile.col * tileSize}
            y={tile.row * tileSize}
            tint={occupancy.has(seat.id) ? LIT_TINT : palette.dimTint}
          />
        );
      })}
    </pixiContainer>
  );
}

const BREATH_PERIOD_MS = 5000;
const BREATH_DEPTH = 0.15;
/** Glow texture is 96px; at 0.5 it covers ~3 tiles. */
const GLOW_SCALE = 0.5;

/** Additive amber halo over each occupied seat; the whole layer breathes slowly. */
export function LightsLayer({ layout, textures, palette, occupancy, animate }: LayerProps & { animate: boolean }) {
  const containerRef = useRef<Container>(null);
  const elapsedRef = useRef(0);
  const { tileSize } = layout;

  useTick({
    isEnabled: animate,
    callback: (ticker: Ticker) => {
      const container = containerRef.current;
      if (!container) return;
      elapsedRef.current = (elapsedRef.current + ticker.deltaMS) % BREATH_PERIOD_MS;
      const phase = (elapsedRef.current / BREATH_PERIOD_MS) * Math.PI * 2;
      container.alpha = 1 - BREATH_DEPTH * (0.5 + 0.5 * Math.sin(phase));
    },
  });

  return (
    <pixiContainer ref={containerRef}>
      {layout.seats.map((seat) => {
        const occupant = occupancy.get(seat.id);
        if (!occupant) return null;
        const prop = getSeatPropTile(seat);
        const seatCenter = tileToPixel(seat.col, seat.row, tileSize);
        const propCenter = tileToPixel(prop.col, prop.row, tileSize);
        return (
          <pixiSprite
            key={seat.id}
            texture={textures.glow}
            anchor={0.5}
            x={(seatCenter.x + propCenter.x) / 2}
            y={(seatCenter.y + propCenter.y) / 2}
            scale={GLOW_SCALE}
            blendMode="add"
            alpha={occupant.isOnline ? palette.glowAlpha : palette.offlineGlowAlpha}
          />
        );
      })}
    </pixiContainer>
  );
}
