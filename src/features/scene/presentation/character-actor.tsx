"use client";

import "./pixi-setup";
import { useTick } from "@pixi/react";
import { useRef } from "react";
import type { Ref, RefObject } from "react";
import type { Container, Sprite, Ticker } from "pixi.js";
import type { Player, SeatKind } from "../domain/world-layout";
import { NameTag } from "./name-tag";
import { OFFLINE_ALPHA } from "./scene-theme";
import type { ScenePalette } from "./scene-theme";
import { StatusIndicator } from "./status-indicator";
import type { SceneTextures } from "./use-scene-textures";

type CharacterActorProps = {
  player: Player;
  textures: SceneTextures;
  palette: ScenePalette;
  /** Kind of the seat the player sits on, when seated. */
  seatKind: SeatKind | null;
  /** Drivers flip this while the character walks (faster bob). */
  movingRef?: RefObject<boolean>;
  animate: boolean;
  /** Set when the ticker is stopped (previews): position comes from props instead of the driver. */
  staticPosition?: { x: number; y: number; zIndex: number };
  ref?: Ref<Container>;
};

const IDLE_PERIOD_MS = 520;
const WALK_PERIOD_MS = 160;
const NAME_TAG_Y = -10;
const INDICATOR_Y = -20;

/**
 * Sprite + name tag + mode badge. Position is driven from the outside through `ref`
 * (world px, sprite center) so movement never re-renders React.
 */
export function CharacterActor({
  player,
  textures,
  palette,
  seatKind,
  movingRef,
  animate,
  staticPosition,
  ref,
}: CharacterActorProps) {
  const spriteRef = useRef<Sprite>(null);
  const elapsedRef = useRef(0);

  useTick({
    isEnabled: animate,
    callback: (ticker: Ticker) => {
      const sprite = spriteRef.current;
      if (!sprite) return;
      const period = movingRef?.current ? WALK_PERIOD_MS : IDLE_PERIOD_MS;
      elapsedRef.current = (elapsedRef.current + ticker.deltaMS) % (period * 2);
      sprite.y = elapsedRef.current < period ? 0 : -1;
    },
  });

  return (
    <pixiContainer ref={ref} alpha={player.isOnline ? 1 : OFFLINE_ALPHA} {...staticPosition}>
      <pixiSprite ref={spriteRef} texture={textures.character(player.spriteVariant)} anchor={0.5} roundPixels />
      <NameTag username={player.username} fontFamily={textures.fontFamily} palette={palette} y={NAME_TAG_Y} />
      {seatKind && (
        <StatusIndicator player={player} seatKind={seatKind} textures={textures} palette={palette} y={INDICATOR_Y} />
      )}
    </pixiContainer>
  );
}
