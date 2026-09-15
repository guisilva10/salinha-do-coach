"use client";

import "./pixi-setup";
import { useEffect, useState } from "react";
import { formatRemainingMinutes } from "../application/scene-helpers";
import { ICON } from "../domain/tile-atlas";
import type { Player, SeatKind } from "../domain/world-layout";
import type { ScenePalette } from "./scene-theme";
import type { SceneTextures } from "./use-scene-textures";

type StatusIndicatorProps = {
  player: Player;
  seatKind: SeatKind;
  textures: SceneTextures;
  palette: ScenePalette;
  y: number;
};

const REFRESH_MS = 30_000;
const ICON_SIZE = 8;

function useNow(isEnabled: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isEnabled) return;
    const id = window.setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [isEnabled]);
  return now;
}

/** Mode badge above a seated player: clock + remaining minutes (focus) or a music note (lofi). */
export function StatusIndicator({ player, seatKind, textures, palette, y }: StatusIndicatorProps) {
  const hasTimer = seatKind === "focus" && player.focusUntil !== undefined;
  const now = useNow(hasTimer);
  if (seatKind === "plain") return null;

  const icon = seatKind === "lofi" ? ICON.NOTE : hasTimer ? ICON.CLOCK : ICON.HOURGLASS;
  const label = hasTimer && player.focusUntil !== undefined ? formatRemainingMinutes(player.focusUntil, now) : "";
  const iconOffset = label ? -ICON_SIZE : -ICON_SIZE / 2;

  return (
    <pixiContainer y={y}>
      <pixiSprite texture={textures.source(icon)} x={iconOffset} y={-ICON_SIZE} roundPixels />
      {label && (
        <pixiText
          text={label}
          x={2}
          y={-ICON_SIZE}
          roundPixels
          style={{
            fontFamily: textures.fontFamily,
            fontSize: 8,
            fill: palette.nameTagFill,
            stroke: { color: palette.nameTagStroke, width: 2 },
          }}
        />
      )}
    </pixiContainer>
  );
}
