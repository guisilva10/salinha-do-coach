import type { Facing, WorldLayout, WorldPosition } from "../domain/world-layout";
import { isSolid } from "./scene-helpers";

export type Direction = { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

export const IDLE_DIRECTION: Direction = { dx: 0, dy: 0 };

/** World pixels per second (3.5 tiles/s at 16px). */
export const WALK_SPEED = 56;

/** Collision box around the feet: half extents, offset below the sprite center. */
const FOOT_HALF_WIDTH = 5;
const FOOT_HALF_HEIGHT = 3;
const FOOT_OFFSET_Y = 4;

export function isIdle(direction: Direction): boolean {
  return direction.dx === 0 && direction.dy === 0;
}

export function facingFromDirection(direction: Direction, fallback: Facing): Facing {
  if (direction.dy < 0) return "up";
  if (direction.dy > 0) return "down";
  if (direction.dx < 0) return "left";
  if (direction.dx > 0) return "right";
  return fallback;
}

function collides(layout: WorldLayout, x: number, y: number): boolean {
  const { tileSize } = layout;
  const left = x - FOOT_HALF_WIDTH;
  const right = x + FOOT_HALF_WIDTH - 1;
  const top = y + FOOT_OFFSET_Y - FOOT_HALF_HEIGHT;
  const bottom = y + FOOT_OFFSET_Y + FOOT_HALF_HEIGHT - 1;
  const corners = [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom],
  ] as const;
  return corners.some(([cx, cy]) =>
    isSolid(layout, Math.floor(cx / tileSize), Math.floor(cy / tileSize)),
  );
}

/**
 * Advances `position` by `direction` for `dtSeconds`, sliding along solid tiles
 * (x and y are resolved independently so walls do not stop diagonal movement).
 */
export function stepPosition(
  layout: WorldLayout,
  position: WorldPosition,
  direction: Direction,
  dtSeconds: number,
): WorldPosition {
  if (isIdle(direction)) return position;
  const length = Math.hypot(direction.dx, direction.dy);
  const distance = WALK_SPEED * dtSeconds;
  const stepX = (direction.dx / length) * distance;
  const stepY = (direction.dy / length) * distance;

  let { x, y } = position;
  if (stepX !== 0 && !collides(layout, x + stepX, y)) x += stepX;
  if (stepY !== 0 && !collides(layout, x, y + stepY)) y += stepY;

  return { x, y, facing: facingFromDirection(direction, position.facing) };
}

export function isSamePosition(a: WorldPosition, b: WorldPosition): boolean {
  return Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y) && a.facing === b.facing;
}

export function roundPosition(position: WorldPosition): WorldPosition {
  return { x: Math.round(position.x), y: Math.round(position.y), facing: position.facing };
}
