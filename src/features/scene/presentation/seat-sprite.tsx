"use client";

import "./pixi-setup";
import { useState } from "react";
import type { Graphics } from "pixi.js";
import { CHAIR_BY_FACING } from "../domain/tile-atlas";
import type { Player, Seat } from "../domain/world-layout";
import { LAMP_COLOR, LIT_TINT } from "./scene-theme";
import type { ScenePalette } from "./scene-theme";
import type { SceneTextures } from "./use-scene-textures";

type SeatSpriteProps = {
  seat: Seat;
  tileSize: number;
  textures: SceneTextures;
  palette: ScenePalette;
  occupant: Player | undefined;
  /** The local player stands next to this free seat: outline it as the sit target. */
  isReachable: boolean;
  interactive: boolean;
  onSelect?: (seatId: string) => void;
};

/** Chair on the actors layer. Chairs whose back faces the viewer are drawn above the sitter. */
export function SeatSprite({
  seat,
  tileSize,
  textures,
  palette,
  occupant,
  isReachable,
  interactive,
  onSelect,
}: SeatSpriteProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isBlocked = occupant?.isOnline === true;
  const canSelect = interactive && !isBlocked;
  const isLit = occupant !== undefined;
  const tint = isLit ? LIT_TINT : isHovered && canSelect ? palette.hoverTint : palette.dimTint;
  const zIndex = seat.row * tileSize + (seat.facing === "up" ? tileSize : 0);

  const drawOutline = (graphics: Graphics) => {
    graphics.clear();
    graphics.rect(0.5, 0.5, tileSize - 1, tileSize - 1).stroke({ color: LAMP_COLOR, width: 1, alpha: 0.9 });
  };

  return (
    <pixiContainer x={seat.col * tileSize} y={seat.row * tileSize} zIndex={zIndex}>
      <pixiSprite
        texture={textures.tile(CHAIR_BY_FACING[seat.facing])}
        tint={tint}
        eventMode={interactive ? "static" : "none"}
        cursor={canSelect ? "pointer" : "not-allowed"}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onPointerTap={() => {
          if (canSelect) onSelect?.(seat.id);
        }}
      />
      {isReachable && <pixiGraphics draw={drawOutline} />}
    </pixiContainer>
  );
}
