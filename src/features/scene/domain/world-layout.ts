export type TileSize = 16 | 32;

export type Facing = "up" | "down" | "left" | "right";

export type SeatKind = "plain" | "focus" | "lofi";

export type Seat = {
  id: string;
  col: number;
  row: number;
  facing: Facing;
  zoneId: string;
  kind: SeatKind;
};

export type TileRect = {
  col: number;
  row: number;
  cols: number;
  rows: number;
};

export type Zone = {
  id: string;
  name: string;
  rect: TileRect;
};

export type TilePosition = {
  col: number;
  row: number;
};

/** Tile id from `TILE` placed at a grid position. Drawn above floor and walls, in array order. */
export type FurniturePlacement = {
  tile: number;
  col: number;
  row: number;
};

export type WorldLayers = {
  /** `rows x cols` grid of tile ids (0 = empty). */
  floor: number[][];
  /** `rows x cols` grid of tile ids (0 = empty). */
  walls: number[][];
  furniture: FurniturePlacement[];
};

export type WorldLayout = {
  id: string;
  name: string;
  cols: number;
  rows: number;
  tileSize: TileSize;
  layers: WorldLayers;
  /** `rows x cols`; `true` = solid (walls, furniture, chairs). */
  collision: boolean[][];
  zones: Zone[];
  seats: Seat[];
  spawn: TilePosition;
};

/**
 * World-space position of a player. `x`/`y` are in world pixels (1 tile = `tileSize` px),
 * measured at the center of the character's tile footprint.
 */
export type WorldPosition = {
  x: number;
  y: number;
  facing: Facing;
};

export type Player = {
  userId: string;
  username: string;
  x: number;
  y: number;
  facing: Facing;
  /** When set, the player is drawn seated at that seat and `x`/`y` are ignored. */
  seatId: string | null;
  isOnline: boolean;
  /** Index into the character sheet variants. See `CHARACTER_VARIANT_COUNT`. */
  spriteVariant: number;
  /** Epoch ms — end of the current focus block (shown as remaining minutes on `focus` seats). */
  focusUntil?: number;
  focusGoal?: string;
};

export type SceneTheme = "dark" | "light";

export const EMPTY_TILE = 0;
