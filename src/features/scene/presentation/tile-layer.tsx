"use client";

import "./pixi-setup";
import { EMPTY_TILE } from "../domain/world-layout";
import type { SceneTextures } from "./use-scene-textures";

type TileLayerProps = {
  grid: number[][];
  tileSize: number;
  textures: SceneTextures;
  tint: number;
};

/** One sprite per non-empty cell of a `rows x cols` grid. */
export function TileLayer({ grid, tileSize, textures, tint }: TileLayerProps) {
  return (
    <pixiContainer>
      {grid.flatMap((line, row) =>
        line.map((tile, col) =>
          tile === EMPTY_TILE ? null : (
            <pixiSprite
              key={`${col}:${row}`}
              texture={textures.tile(tile)}
              x={col * tileSize}
              y={row * tileSize}
              tint={tint}
            />
          ),
        ),
      )}
    </pixiContainer>
  );
}
