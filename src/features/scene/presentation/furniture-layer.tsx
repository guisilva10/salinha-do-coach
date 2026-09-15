"use client";

import "./pixi-setup";
import type { FurniturePlacement } from "../domain/world-layout";
import type { SceneTextures } from "./use-scene-textures";

type FurnitureLayerProps = {
  items: FurniturePlacement[];
  tileSize: number;
  textures: SceneTextures;
  tint: number;
};

/** Props drawn in array order (later items overlap earlier ones on the same cell). */
export function FurnitureLayer({ items, tileSize, textures, tint }: FurnitureLayerProps) {
  return (
    <pixiContainer>
      {items.map((item, index) => (
        <pixiSprite
          key={`${index}:${item.tile}:${item.col}:${item.row}`}
          texture={textures.tile(item.tile)}
          x={item.col * tileSize}
          y={item.row * tileSize}
          tint={tint}
        />
      ))}
    </pixiContainer>
  );
}
