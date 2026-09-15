import { CHARACTER_VARIANT_COUNT } from "../domain/tile-atlas";
import type { Player, Seat, TilePosition, WorldLayout, WorldPosition, Zone } from "../domain/world-layout";

export type PixelPoint = { x: number; y: number };

/** Center of a tile in world pixels. */
export function tileToPixel(col: number, row: number, tileSize: number): PixelPoint {
  return { x: col * tileSize + tileSize / 2, y: row * tileSize + tileSize / 2 };
}

export function pixelToTile(x: number, y: number, tileSize: number): TilePosition {
  return { col: Math.floor(x / tileSize), row: Math.floor(y / tileSize) };
}

export function isSolid(layout: WorldLayout, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= layout.cols || row >= layout.rows) return true;
  return layout.collision[row][col];
}

export function getSeatById(layout: WorldLayout, seatId: string | null): Seat | undefined {
  if (!seatId) return undefined;
  return layout.seats.find((seat) => seat.id === seatId);
}

/** Tile the player stands on (or the seat tile when seated). */
export function getPlayerTile(layout: WorldLayout, player: Player): TilePosition {
  const seat = getSeatById(layout, player.seatId);
  if (seat) return { col: seat.col, row: seat.row };
  return pixelToTile(player.x, player.y, layout.tileSize);
}

/** Where a new player appears: the layout's spawn tile, facing down. */
export function getSpawnPosition(layout: WorldLayout): WorldPosition {
  const point = tileToPixel(layout.spawn.col, layout.spawn.row, layout.tileSize);
  return { ...point, facing: "down" };
}

export function getZoneAt(layout: WorldLayout, tile: TilePosition): Zone | undefined {
  return layout.zones.find(
    ({ rect }) =>
      tile.col >= rect.col &&
      tile.col < rect.col + rect.cols &&
      tile.row >= rect.row &&
      tile.row < rect.row + rect.rows,
  );
}

export function getPlayerZone(layout: WorldLayout, player: Player): Zone | undefined {
  return getZoneAt(layout, getPlayerTile(layout, player));
}

/** seatId → player sitting there. Offline players keep their seat until evicted. */
export function getSeatOccupancy(players: Player[]): Map<string, Player> {
  const occupancy = new Map<string, Player>();
  for (const player of players) {
    if (player.seatId) occupancy.set(player.seatId, player);
  }
  return occupancy;
}

/** Seats without an online occupant (offline occupants can be evicted by the backend). */
export function getFreeSeats(layout: WorldLayout, players: Player[]): Seat[] {
  const occupancy = getSeatOccupancy(players);
  return layout.seats.filter((seat) => !occupancy.get(seat.id)?.isOnline);
}

/** Closest seat next to `tile` (8-neighborhood) that is free to take. */
export function findAdjacentSeat(layout: WorldLayout, tile: TilePosition, players: Player[]): Seat | undefined {
  const free = getFreeSeats(layout, players);
  let best: Seat | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const seat of free) {
    const dc = Math.abs(seat.col - tile.col);
    const dr = Math.abs(seat.row - tile.row);
    if (Math.max(dc, dr) !== 1) continue;
    const distance = dc + dr;
    if (distance < bestDistance) {
      best = seat;
      bestDistance = distance;
    }
  }
  return best;
}

const OPPOSITE_OFFSET = {
  up: { col: 0, row: 1 },
  down: { col: 0, row: -1 },
  left: { col: 1, row: 0 },
  right: { col: -1, row: 0 },
} as const;

const NEIGHBOR_OFFSETS = [
  { col: 0, row: 1 },
  { col: 0, row: -1 },
  { col: -1, row: 0 },
  { col: 1, row: 0 },
] as const;

/** Where a player lands when standing up: behind the chair if free, else any free neighbor. */
export function getStandTile(layout: WorldLayout, seat: Seat): TilePosition {
  const candidates = [OPPOSITE_OFFSET[seat.facing], ...NEIGHBOR_OFFSETS];
  for (const offset of candidates) {
    const col = seat.col + offset.col;
    const row = seat.row + offset.row;
    if (!isSolid(layout, col, row)) return { col, row };
  }
  return { col: seat.col, row: seat.row };
}

export function pickSpriteVariant(username: string): number {
  let hash = 5381;
  for (let i = 0; i < username.length; i += 1) {
    hash = ((hash << 5) + hash + username.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % CHARACTER_VARIANT_COUNT;
}

export function formatRemainingMinutes(focusUntil: number, now: number): string {
  const minutes = Math.max(0, Math.ceil((focusUntil - now) / 60_000));
  return `${minutes}m`;
}

function listNames(players: Player[]): string {
  const names = players.map((player) => player.username);
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} e mais ${names.length - 3}`;
}

/** pt-BR description for `aria-label` of the scene. */
export function describeWorld(layout: WorldLayout, players: Player[]): string {
  const online = players.filter((player) => player.isOnline);
  const seated = online.filter((player) => player.seatId);
  const zoneSummaries = layout.zones
    .map((zone) => {
      const inZone = online.filter((player) => getPlayerZone(layout, player)?.id === zone.id);
      if (inZone.length === 0) return `${zone.name}: vazia`;
      return `${zone.name}: ${listNames(inZone)}`;
    })
    .join("; ");
  const head = `${layout.name}, ${layout.zones.length} zonas e ${layout.seats.length} assentos.`;
  const presence =
    online.length === 0
      ? "Nenhuma luz acesa no momento."
      : `${online.length} ${online.length === 1 ? "pessoa" : "pessoas"} no escritório, ${seated.length} ${seated.length === 1 ? "sentada" : "sentadas"} com a luz acesa.`;
  return `${head} ${presence} ${zoneSummaries}.`;
}
