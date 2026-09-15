import {
  buildCollision,
  buildFloor,
  buildWalls,
  isInRect,
  place,
  placeBookshelf,
  placePiano,
  placeRug,
  placeStandLamp,
  placeWideDesk,
  seatPair,
  seatsInRow,
} from "../layout-builder";
import type { Divider, FloorStyle } from "../layout-builder";
import { TILE } from "../tile-atlas";
import type { FurniturePlacement, Seat, WorldLayout, Zone } from "../world-layout";

const COLS = 40;
const ROWS = 30;

export const OFFICE_ZONES: Zone[] = [
  { id: "library", name: "Biblioteca", rect: { col: 1, row: 2, cols: 19, rows: 13 } },
  { id: "cafe", name: "Café da Madrugada", rect: { col: 21, row: 2, cols: 18, rows: 13 } },
  { id: "studio", name: "Estúdio", rect: { col: 1, row: 17, cols: 19, rows: 12 } },
  { id: "reception", name: "Recepção", rect: { col: 21, row: 17, cols: 18, rows: 12 } },
];

const FLOOR_BY_ZONE: Record<string, FloorStyle> = {
  library: "wood",
  cafe: "stone-light",
  studio: "stone-gray",
  reception: "wood",
};

const DIVIDERS: Divider[] = [
  { orientation: "horizontal", row: 15, fromCol: 1, toCol: 38, gaps: [9, 10, 29, 30] },
  { orientation: "vertical", col: 20, fromRow: 1, toRow: 28, gaps: [7, 8, 22, 23] },
];

const libraryFurniture: FurniturePlacement[] = [
  ...placeBookshelf("a", 2, 1),
  ...placeBookshelf("b", 3, 1),
  ...placeBookshelf("c", 5, 1),
  ...placeBookshelf("a", 6, 1),
  place(TILE.WINDOW_WOOD, 9, 1),
  place(TILE.WINDOW_WOOD, 10, 1),
  place(TILE.WALL_CLOCK, 11, 1),
  ...placeBookshelf("b", 13, 1),
  ...placeBookshelf("c", 14, 1),
  ...placeBookshelf("a", 16, 1),
  ...placeBookshelf("b", 17, 1),
  ...placeStandLamp(1, 4),
  ...placeStandLamp(18, 4),
  ...placeRug("moss", 8, 7),
  ...placeWideDesk(3, 6),
  ...placeWideDesk(14, 6),
  ...placeWideDesk(8, 11),
  place(TILE.PLANT_TALL, 1, 14),
  place(TILE.PLANT_SHORT, 18, 14),
];

const cafeFurniture: FurniturePlacement[] = [
  place(TILE.WINDOW_WHITE, 30, 1),
  place(TILE.WINDOW_WHITE, 32, 1),
  place(TILE.WINDOW_WHITE, 34, 1),
  place(TILE.FIREPLACE, 36, 1),
  place(TILE.COUNTER, 22, 2),
  place(TILE.COFFEE_MACHINE, 23, 2),
  place(TILE.COUNTER_CUPS, 24, 2),
  place(TILE.COUNTER_BOTTLES, 25, 2),
  place(TILE.COUNTER, 26, 2),
  place(TILE.COUNTER_SINK, 27, 2),
  place(TILE.COUNTER, 28, 2),
  place(TILE.SPEAKER, 29, 2),
  ...placePiano(37, 3),
  ...placeRug("rust", 28, 7),
  place(TILE.TABLE_ROUND, 24, 6),
  place(TILE.TABLE_ROUND, 34, 6),
  place(TILE.TABLE_ROUND, 24, 11),
  place(TILE.TABLE_ROUND, 34, 11),
  place(TILE.TABLE_ROUND_SMALL, 29, 12),
  place(TILE.TEAPOT, 29, 12),
  place(TILE.PLANT_TALL, 21, 13),
  place(TILE.PLANT_SHORT, 38, 13),
];

const studioFurniture: FurniturePlacement[] = [
  place(TILE.MAP_FRAME, 4, 16),
  place(TILE.MAP_FRAME, 5, 16),
  place(TILE.PAINTING, 14, 16),
  place(TILE.WALL_CLOCK, 16, 16),
  ...placeStandLamp(1, 18),
  ...placeStandLamp(18, 18),
  ...placeRug("moss", 8, 19),
  ...placeWideDesk(3, 20),
  ...placeWideDesk(14, 20),
  ...placeWideDesk(8, 25),
  place(TILE.SPEAKER, 18, 27),
  place(TILE.PLANT_POT, 1, 28),
  place(TILE.PLANT_TALL, 18, 28),
];

const receptionFurniture: FurniturePlacement[] = [
  place(TILE.PAINTING, 24, 16),
  place(TILE.PAINTING, 26, 16),
  place(TILE.PAINTING, 33, 16),
  place(TILE.PAINTING, 35, 16),
  place(TILE.COUNTER, 32, 19),
  place(TILE.COUNTER_CUPS, 33, 19),
  place(TILE.COUNTER, 34, 19),
  ...placeRug("rust", 28, 22),
  place(TILE.TABLE_ROUND, 24, 22),
  place(TILE.TABLE_ROUND, 34, 24),
  place(TILE.CUP, 34, 24),
  place(TILE.PLANT_TALL, 22, 17),
  place(TILE.PLANT_SHORT, 37, 17),
  place(TILE.PLANT_POT, 22, 28),
  place(TILE.PLANT_TALL, 37, 28),
];

const library = { zoneId: "library", kind: "focus" } as const;
const cafe = { zoneId: "cafe", kind: "lofi" } as const;
const reception = { zoneId: "reception", kind: "plain" } as const;

const OFFICE_SEATS: Seat[] = [
  // Biblioteca — maioria foco
  ...seatsInRow(3, 5, 3, "down", 1, library),
  ...seatsInRow(14, 5, 3, "down", 4, library),
  ...seatsInRow(8, 10, 2, "down", 7, library),
  { id: "seat-9", col: 10, row: 10, facing: "down", zoneId: "library", kind: "plain" },
  // Café — maioria lofi
  ...seatPair(24, 6, 10, cafe),
  ...seatPair(34, 6, 12, cafe),
  ...seatPair(24, 11, 14, cafe),
  ...seatPair(34, 11, 16, { zoneId: "cafe", kind: "plain" }),
  // Estúdio — misto
  ...seatsInRow(3, 19, 2, "down", 18, { zoneId: "studio", kind: "focus" }),
  { id: "seat-20", col: 5, row: 19, facing: "down", zoneId: "studio", kind: "plain" },
  ...seatsInRow(14, 19, 2, "down", 21, { zoneId: "studio", kind: "lofi" }),
  { id: "seat-23", col: 16, row: 19, facing: "down", zoneId: "studio", kind: "plain" },
  { id: "seat-24", col: 8, row: 24, facing: "down", zoneId: "studio", kind: "focus" },
  { id: "seat-25", col: 9, row: 24, facing: "down", zoneId: "studio", kind: "lofi" },
  { id: "seat-26", col: 10, row: 24, facing: "down", zoneId: "studio", kind: "plain" },
  // Recepção — só assentos comuns
  ...seatPair(24, 22, 27, reception),
  ...seatPair(34, 24, 29, reception),
];

const furniture = [...libraryFurniture, ...cafeFurniture, ...studioFurniture, ...receptionFurniture];
const walls = buildWalls(COLS, ROWS, "plaster", DIVIDERS);
const floor = buildFloor(walls, (col, row) => {
  const zone = OFFICE_ZONES.find((z) => isInRect(z.rect, col, row));
  return zone ? FLOOR_BY_ZONE[zone.id] : "wood";
});

export const OFFICE_LAYOUT: WorldLayout = {
  id: "office",
  name: "Escritório da Salinha",
  cols: COLS,
  rows: ROWS,
  tileSize: 16,
  layers: { floor, walls, furniture },
  collision: buildCollision(walls, furniture, OFFICE_SEATS),
  zones: OFFICE_ZONES,
  seats: OFFICE_SEATS,
  spawn: { col: 29, row: 26 },
};
