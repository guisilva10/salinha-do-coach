export type Size = { width: number; height: number };

export type Point = { x: number; y: number };

const MIN_SCALE = 2;
const MAX_SCALE = 3;
/** Viewport width (CSS px) per extra zoom step. */
const SCALE_STEP = 256;

/** Integer zoom for the interactive scene: 2x on phones, 3x from ~768px up. */
export function computeWorldScale(viewportWidth: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.floor(viewportWidth / SCALE_STEP)));
}

/** Largest integer zoom that fits the whole world in `viewport` (min 1). */
export function computeFitScale(world: Size, viewport: Size): number {
  const scale = Math.floor(Math.min(viewport.width / world.width, viewport.height / world.height));
  return Math.max(1, scale);
}

/**
 * Container position (in screen px) that keeps `target` (world px) centered,
 * clamped to the world edges; worlds smaller than the viewport are centered.
 * `bottomInset` reserves screen px at the bottom (on-screen controls) so the
 * target is centered in the uncovered area.
 */
export function computeCamera(target: Point, viewport: Size, world: Size, scale: number, bottomInset = 0): Point {
  const scaledWorld = { width: world.width * scale, height: world.height * scale };
  const axis = (focus: number, viewportSize: number, worldSize: number, inset: number): number => {
    if (worldSize <= viewportSize) return Math.round((viewportSize - worldSize) / 2);
    const desired = (viewportSize - inset) / 2 - focus * scale;
    return Math.round(Math.min(0, Math.max(viewportSize - inset - worldSize, desired)));
  };
  return {
    x: axis(target.x, viewport.width, scaledWorld.width, 0),
    y: axis(target.y, viewport.height, scaledWorld.height, bottomInset),
  };
}
