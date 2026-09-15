/**
 * Public surface of the scene module. Pixi-backed components are exposed only through
 * `next/dynamic` wrappers so importing this file never pulls PixiJS into a server bundle.
 */
export type {
  Facing,
  FurniturePlacement,
  Player,
  SceneTheme,
  Seat,
  SeatKind,
  TilePosition,
  TileRect,
  TileSize,
  WorldLayers,
  WorldLayout,
  WorldPosition,
  Zone,
} from "./domain/world-layout";
export { EMPTY_TILE } from "./domain/world-layout";
export { CHARACTER_VARIANT_COUNT, TILE } from "./domain/tile-atlas";
export { OFFICE_LAYOUT, OFFICE_ZONES } from "./domain/layouts/office";

export {
  describeWorld,
  findAdjacentSeat,
  formatRemainingMinutes,
  getFreeSeats,
  getPlayerTile,
  getPlayerZone,
  getSeatById,
  getSeatOccupancy,
  getSpawnPosition,
  getStandTile,
  getZoneAt,
  isSolid,
  pickSpriteVariant,
  pixelToTile,
  tileToPixel,
} from "./application/scene-helpers";
export { WALK_SPEED, stepPosition } from "./application/movement";
export type { Direction } from "./application/movement";

export { LazyWorldScene, LazyWorldScenePreview } from "./presentation/lazy";
export type { WorldSceneProps } from "./presentation/world-scene";
export type { WorldScenePreviewProps } from "./presentation/world-scene-preview";
