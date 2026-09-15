import { tileToPixel } from "../application/scene-helpers";
import type { PixelPoint } from "../application/scene-helpers";
import type { Seat, WorldLayout } from "../domain/world-layout";

/** Sprite center is lifted a few px so the character looks seated on the chair. */
const SIT_OFFSET_Y = 3;
/** Sort actors by their feet, not their center. */
const FEET_OFFSET_Y = 8;

export function getSeatedPoint(layout: WorldLayout, seat: Seat): PixelPoint {
  const center = tileToPixel(seat.col, seat.row, layout.tileSize);
  return { x: center.x, y: center.y - SIT_OFFSET_Y };
}

export function actorZIndex(y: number): number {
  return y + FEET_OFFSET_Y;
}
