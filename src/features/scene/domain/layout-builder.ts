import { EMPTY_TILE } from "./world-layout";
import type { Facing, FurniturePlacement, Seat, SeatKind, TileRect } from "./world-layout";
import { TILE, WALKABLE_TILES } from "./tile-atlas";

export type FloorStyle = "wood" | "stone-light" | "stone-gray";
export type WallStyle = "plaster" | "wood";

/**
 * Inner wall. Horizontal dividers take two rows (cap + face); vertical ones take one column.
 * `gaps` lists the columns (horizontal) or rows (vertical) left open as doorways.
 */
export type Divider =
  | { orientation: "horizontal"; row: number; fromCol: number; toCol: number; gaps: number[] }
  | { orientation: "vertical"; col: number; fromRow: number; toRow: number; gaps: number[] };

const FLOOR_VARIANTS: Record<FloorStyle, readonly number[]> = {
  wood: [TILE.FLOOR_WOOD, TILE.FLOOR_WOOD_ALT],
  "stone-light": [TILE.FLOOR_STONE_LIGHT, TILE.FLOOR_STONE_LIGHT_ALT],
  "stone-gray": [TILE.FLOOR_STONE_GRAY, TILE.FLOOR_STONE_GRAY_ALT],
};

const WALL_TILES: Record<WallStyle, { top: number; face: number }> = {
  plaster: { top: TILE.WALL_TOP, face: TILE.WALL_FACE },
  wood: { top: TILE.WALL_WOOD_TOP, face: TILE.WALL_WOOD_FACE },
};

function hashCell(col: number, row: number): number {
  return Math.abs((col * 73856093) ^ (row * 19349663));
}

export function createGrid<T>(cols: number, rows: number, fill: T): T[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

export function isInRect(rect: TileRect, col: number, row: number): boolean {
  return col >= rect.col && col < rect.col + rect.cols && row >= rect.row && row < rect.row + rect.rows;
}

/** Outer walls (cap on row 0 / last row / outer columns, face on row 1) plus inner dividers. */
export function buildWalls(cols: number, rows: number, style: WallStyle, dividers: Divider[]): number[][] {
  const wall = WALL_TILES[style];
  const grid = createGrid(cols, rows, EMPTY_TILE);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) grid[row][col] = wall.top;
      else if (row === 1) grid[row][col] = wall.face;
    }
  }
  for (const divider of dividers) {
    if (divider.orientation === "horizontal") {
      for (let col = divider.fromCol; col <= divider.toCol; col += 1) {
        if (divider.gaps.includes(col)) continue;
        grid[divider.row][col] = wall.top;
        grid[divider.row + 1][col] = wall.face;
      }
    } else {
      for (let row = divider.fromRow; row <= divider.toRow; row += 1) {
        if (divider.gaps.includes(row)) continue;
        grid[row][divider.col] = wall.top;
      }
    }
  }
  return grid;
}

/** Floor under every non-wall cell, with a deterministic sprinkle of variant tiles. */
export function buildFloor(
  walls: number[][],
  styleAt: (col: number, row: number) => FloorStyle,
): number[][] {
  return walls.map((line, row) =>
    line.map((wallTile, col) => {
      if (wallTile !== EMPTY_TILE) return EMPTY_TILE;
      const variants = FLOOR_VARIANTS[styleAt(col, row)];
      const roll = hashCell(col, row) % 11;
      return roll < variants.length - 1 ? variants[roll + 1] : variants[0];
    }),
  );
}

export function buildCollision(walls: number[][], furniture: FurniturePlacement[], seats: Seat[]): boolean[][] {
  const grid = walls.map((line) => line.map((tile) => tile !== EMPTY_TILE));
  for (const item of furniture) {
    if (!WALKABLE_TILES.has(item.tile)) grid[item.row][item.col] = true;
  }
  for (const seat of seats) grid[seat.row][seat.col] = true;
  return grid;
}

export function place(tile: number, col: number, row: number): FurniturePlacement {
  return { tile, col, row };
}

/** 3-tile wide desk: left cap, middle, right cap. */
export function placeWideDesk(col: number, row: number): FurniturePlacement[] {
  return [
    place(TILE.DESK_WIDE_L, col, row),
    place(TILE.DESK_WIDE_M, col + 1, row),
    place(TILE.DESK_WIDE_R, col + 2, row),
  ];
}

export function placeRug(kind: "moss" | "rust", col: number, row: number): FurniturePlacement[] {
  const tiles =
    kind === "moss"
      ? [
          [TILE.RUG_MOSS_TL, TILE.RUG_MOSS_T, TILE.RUG_MOSS_TR],
          [TILE.RUG_MOSS_L, TILE.RUG_MOSS_C, TILE.RUG_MOSS_R],
          [TILE.RUG_MOSS_BL, TILE.RUG_MOSS_B, TILE.RUG_MOSS_BR],
        ]
      : [
          [TILE.RUG_RUST_TL, TILE.RUG_RUST_T, TILE.RUG_RUST_TR],
          [TILE.RUG_RUST_L, TILE.RUG_RUST_C, TILE.RUG_RUST_R],
          [TILE.RUG_RUST_BL, TILE.RUG_RUST_B, TILE.RUG_RUST_BR],
        ];
  return tiles.flatMap((line, dy) => line.map((tile, dx) => place(tile, col + dx, row + dy)));
}

export function placeBookshelf(variant: "a" | "b" | "c", col: number, row: number): FurniturePlacement[] {
  const [top, bottom] = {
    a: [TILE.BOOKSHELF_A_TOP, TILE.BOOKSHELF_A_BOTTOM],
    b: [TILE.BOOKSHELF_B_TOP, TILE.BOOKSHELF_B_BOTTOM],
    c: [TILE.BOOKSHELF_C_TOP, TILE.BOOKSHELF_C_BOTTOM],
  }[variant];
  return [place(top, col, row), place(bottom, col, row + 1)];
}

export function placeStandLamp(col: number, row: number): FurniturePlacement[] {
  return [place(TILE.LAMP_STAND_TOP, col, row), place(TILE.LAMP_STAND_BOTTOM, col, row + 1)];
}

export function placePiano(col: number, row: number): FurniturePlacement[] {
  return [place(TILE.PIANO_TOP, col, row), place(TILE.PIANO_BOTTOM, col, row + 1)];
}

type SeatSpec = { zoneId: string; kind: SeatKind };

/** `count` side-by-side seats starting at `startCol`, ids continue from `firstIndex`. */
export function seatsInRow(
  startCol: number,
  row: number,
  count: number,
  facing: Facing,
  firstIndex: number,
  spec: SeatSpec,
): Seat[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `seat-${firstIndex + i}`,
    col: startCol + i,
    row,
    facing,
    ...spec,
  }));
}

/** Two seats flanking a table at `col`: left one faces right, right one faces left. */
export function seatPair(col: number, row: number, firstIndex: number, spec: SeatSpec): Seat[] {
  return [
    { id: `seat-${firstIndex}`, col: col - 1, row, facing: "right", ...spec },
    { id: `seat-${firstIndex + 1}`, col: col + 1, row, facing: "left", ...spec },
  ];
}
