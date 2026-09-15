/**
 * Semantic tile registry over the Kenney CC0 sheets in `public/sprites/`.
 * Every sheet is a 16px grid with a 1px gutter between tiles.
 */
export type SheetId = "rpg" | "indoor" | "characters" | "props" | "icons";

export type SheetSource = {
  url: string;
  tileSize: number;
  margin: number;
};

export const SHEETS: Record<SheetId, SheetSource> = {
  rpg: { url: "/sprites/kenney-roguelike-rpg/tiles.png", tileSize: 16, margin: 1 },
  indoor: { url: "/sprites/kenney-roguelike-indoors/tiles.png", tileSize: 16, margin: 1 },
  characters: {
    url: "/sprites/kenney-roguelike-characters/characters.png",
    tileSize: 16,
    margin: 1,
  },
  props: { url: "/sprites/generated/props.png", tileSize: 16, margin: 0 },
  icons: { url: "/sprites/generated/icons.png", tileSize: 8, margin: 0 },
};

export const GLOW_URL = "/sprites/generated/glow.png";
export const PIXEL_FONT_URL = "/sprites/pixelify-sans/pixelify-sans-regular.ttf";
export const PIXEL_FONT_FAMILY = "Pixelify Sans";

export type TileSource = {
  sheet: SheetId;
  col: number;
  row: number;
};

const sources: TileSource[] = [];

function define(sheet: SheetId, col: number, row: number): number {
  sources.push({ sheet, col, row });
  return sources.length;
}

export const TILE = {
  // Floors (rpg)
  FLOOR_WOOD: define("rpg", 1, 25),
  FLOOR_WOOD_ALT: define("rpg", 0, 25),
  FLOOR_STONE_LIGHT: define("rpg", 42, 26),
  FLOOR_STONE_LIGHT_ALT: define("rpg", 6, 25),
  FLOOR_STONE_GRAY: define("rpg", 3, 25),
  FLOOR_STONE_GRAY_ALT: define("rpg", 4, 27),
  // Rugs 3x3 (rpg) — moss green
  RUG_MOSS_TL: define("rpg", 10, 16),
  RUG_MOSS_T: define("rpg", 11, 16),
  RUG_MOSS_TR: define("rpg", 12, 16),
  RUG_MOSS_L: define("rpg", 10, 17),
  RUG_MOSS_C: define("rpg", 11, 17),
  RUG_MOSS_R: define("rpg", 12, 17),
  RUG_MOSS_BL: define("rpg", 10, 18),
  RUG_MOSS_B: define("rpg", 11, 18),
  RUG_MOSS_BR: define("rpg", 12, 18),
  // Rugs 3x3 (rpg) — terracotta
  RUG_RUST_TL: define("rpg", 10, 13),
  RUG_RUST_T: define("rpg", 11, 13),
  RUG_RUST_TR: define("rpg", 12, 13),
  RUG_RUST_L: define("rpg", 10, 14),
  RUG_RUST_C: define("rpg", 11, 14),
  RUG_RUST_R: define("rpg", 12, 14),
  RUG_RUST_BL: define("rpg", 10, 15),
  RUG_RUST_B: define("rpg", 11, 15),
  RUG_RUST_BR: define("rpg", 12, 15),
  // Walls (rpg) — plaster
  WALL_TOP: define("rpg", 14, 12),
  WALL_FACE: define("rpg", 13, 15),
  WALL_FACE_LOW: define("rpg", 13, 16),
  // Walls (rpg) — wood panel
  WALL_WOOD_TOP: define("rpg", 35, 12),
  WALL_WOOD_FACE: define("rpg", 34, 15),
  WALL_WOOD_FACE_LOW: define("rpg", 34, 16),
  // Wall props (rpg)
  WINDOW_WOOD: define("rpg", 45, 4),
  WINDOW_WHITE: define("rpg", 41, 4),
  BOOKSHELF_A_TOP: define("rpg", 42, 12),
  BOOKSHELF_A_BOTTOM: define("rpg", 42, 14),
  BOOKSHELF_B_TOP: define("rpg", 45, 12),
  BOOKSHELF_B_BOTTOM: define("rpg", 45, 14),
  BOOKSHELF_C_TOP: define("rpg", 48, 12),
  BOOKSHELF_C_BOTTOM: define("rpg", 48, 14),
  SHELF_EMPTY: define("rpg", 41, 13),
  PAINTING: define("rpg", 45, 16),
  MAP_FRAME: define("rpg", 47, 16),
  FIREPLACE: define("rpg", 54, 8),
  TEAPOT: define("rpg", 55, 15),
  CUP: define("rpg", 56, 15),
  // Furniture (indoor)
  DESK: define("indoor", 0, 0),
  DESK_WIDE_L: define("indoor", 4, 4),
  DESK_WIDE_M: define("indoor", 5, 4),
  DESK_WIDE_R: define("indoor", 6, 4),
  TABLE_ROUND: define("indoor", 3, 0),
  TABLE_ROUND_SMALL: define("indoor", 7, 0),
  CHAIR_DOWN: define("indoor", 0, 4),
  CHAIR_UP: define("indoor", 1, 4),
  CHAIR_RIGHT: define("indoor", 2, 4),
  CHAIR_LEFT: define("indoor", 3, 4),
  PLANT_TALL: define("indoor", 16, 0),
  PLANT_SHORT: define("indoor", 17, 0),
  PLANT_POT: define("indoor", 17, 3),
  LAMP_CANDLE: define("indoor", 16, 6),
  LAMP_CANDELABRA: define("indoor", 19, 0),
  LAMP_STAND_TOP: define("indoor", 19, 4),
  LAMP_STAND_BOTTOM: define("indoor", 19, 5),
  COUNTER: define("indoor", 1, 12),
  COUNTER_BOTTLES: define("indoor", 5, 12),
  COUNTER_CUPS: define("indoor", 7, 12),
  COUNTER_SINK: define("indoor", 8, 12),
  COFFEE_MACHINE: define("indoor", 14, 14),
  PIANO_TOP: define("indoor", 23, 8),
  PIANO_BOTTOM: define("indoor", 23, 9),
  SPEAKER: define("indoor", 14, 16),
  WALL_CLOCK: define("rpg", 26, 8),
  // Own pixel props (public/sprites/generated/props.png)
  PROP_HOURGLASS: define("props", 0, 0),
  PROP_HEADPHONES: define("props", 1, 0),
  PROP_RADIO: define("props", 2, 0),
  PROP_LAMP: define("props", 3, 0),
} as const;

/** 8x8 status icons drawn above seated players (public/sprites/generated/icons.png). */
export const ICON = {
  CLOCK: { sheet: "icons", col: 0, row: 0 },
  NOTE: { sheet: "icons", col: 1, row: 0 },
  HOURGLASS: { sheet: "icons", col: 2, row: 0 },
} as const satisfies Record<string, TileSource>;

export type TileId = (typeof TILE)[keyof typeof TILE];

export function getTileSource(id: number): TileSource | undefined {
  return sources[id - 1];
}

/** Rugs are drawn as furniture but do not block movement. */
export const WALKABLE_TILES: ReadonlySet<number> = new Set([
  TILE.RUG_MOSS_TL, TILE.RUG_MOSS_T, TILE.RUG_MOSS_TR,
  TILE.RUG_MOSS_L, TILE.RUG_MOSS_C, TILE.RUG_MOSS_R,
  TILE.RUG_MOSS_BL, TILE.RUG_MOSS_B, TILE.RUG_MOSS_BR,
  TILE.RUG_RUST_TL, TILE.RUG_RUST_T, TILE.RUG_RUST_TR,
  TILE.RUG_RUST_L, TILE.RUG_RUST_C, TILE.RUG_RUST_R,
  TILE.RUG_RUST_BL, TILE.RUG_RUST_B, TILE.RUG_RUST_BR,
]);

/** Desk prop that tells the seat kind apart, drawn on the tile the chair faces. */
export const SEAT_PROP_BY_KIND = {
  plain: TILE.PROP_LAMP,
  focus: TILE.PROP_HOURGLASS,
  lofi: TILE.PROP_HEADPHONES,
} as const;

export const CHAIR_BY_FACING = {
  up: TILE.CHAIR_UP,
  down: TILE.CHAIR_DOWN,
  left: TILE.CHAIR_LEFT,
  right: TILE.CHAIR_RIGHT,
} as const;

/** Pre-made characters on the characters sheet: two columns starting at row 5. */
export const CHARACTER_VARIANT_COUNT = 14;

export function getCharacterSource(variant: number): TileSource {
  const index = ((variant % CHARACTER_VARIANT_COUNT) + CHARACTER_VARIANT_COUNT) % CHARACTER_VARIANT_COUNT;
  return { sheet: "characters", col: index % 2, row: 5 + Math.floor(index / 2) };
}
