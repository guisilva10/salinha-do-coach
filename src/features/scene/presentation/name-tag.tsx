"use client";

import "./pixi-setup";
import type { ScenePalette } from "./scene-theme";

type NameTagProps = {
  username: string;
  fontFamily: string;
  palette: ScenePalette;
  y: number;
};

const MAX_LENGTH = 14;

/** Pixel-font label above a character: light fill with a dark outline stays readable on any floor. */
export function NameTag({ username, fontFamily, palette, y }: NameTagProps) {
  const label = username.length > MAX_LENGTH ? `${username.slice(0, MAX_LENGTH - 1)}…` : username;
  return (
    <pixiText
      text={label}
      anchor={{ x: 0.5, y: 1 }}
      y={y}
      roundPixels
      style={{
        fontFamily,
        fontSize: 8,
        fill: palette.nameTagFill,
        stroke: { color: palette.nameTagStroke, width: 2 },
        align: "center",
      }}
    />
  );
}
