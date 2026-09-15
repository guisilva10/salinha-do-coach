import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { OFFICE_LAYOUT } from "../src/features/scene/domain/layouts/office";
import { presence } from "./presence";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

const OFFICE_ROOM = "office";
const MAX_FOCUS_MINUTES = 25;
const MAX_FOCUS_GOAL_LENGTH = 80;
const MAP_WIDTH = OFFICE_LAYOUT.cols * OFFICE_LAYOUT.tileSize;
const MAP_HEIGHT = OFFICE_LAYOUT.rows * OFFICE_LAYOUT.tileSize;

const facing = v.union(
  v.literal("up"),
  v.literal("down"),
  v.literal("left"),
  v.literal("right"),
);

async function requireAuthUserId(ctx: MutationCtx | QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Nao autenticado.");
  }
  return userId;
}

async function getPlayerByUser(
  ctx: MutationCtx | QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"players"> | null> {
  return ctx.db
    .query("players")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

async function isUserOnline(ctx: MutationCtx | QueryCtx, userId: Id<"users">): Promise<boolean> {
  const rows = await presence.listRoom(ctx, OFFICE_ROOM, false);
  return rows.some((row) => row.userId === userId && row.online);
}

/** Loga a sessão concluída em `focusSessions` e limpa o estado de foco do player. */
async function endFocusSession(ctx: MutationCtx, player: Doc<"players">, endedAt: number) {
  if (player.focusStartedAt !== undefined) {
    const minutes = Math.max(1, Math.round((endedAt - player.focusStartedAt) / 60_000));
    await ctx.db.insert("focusSessions", {
      userId: player.userId,
      zoneId: player.zoneId,
      startedAt: player.focusStartedAt,
      endedAt,
      minutes,
    });
  }

  await ctx.db.patch(player._id, {
    focusGoal: undefined,
    focusStartedAt: undefined,
    focusUntil: undefined,
    updatedAt: endedAt,
  });
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

/** Posição sempre dentro dos limites reais do mapa (`OFFICE_LAYOUT`) — nunca confia no client puro. */
function clampToMap(x: number, y: number): { x: number; y: number } {
  return { x: clamp(x, 0, MAP_WIDTH), y: clamp(y, 0, MAP_HEIGHT) };
}

function isRealZone(zoneId: string): boolean {
  return OFFICE_LAYOUT.zones.some((zone) => zone.id === zoneId);
}

function requireRealZone(zoneId: string): string {
  if (!isRealZone(zoneId)) {
    throw new ConvexError("Zona invalida.");
  }
  return zoneId;
}

function getRealSeat(seatId: string) {
  const seat = OFFICE_LAYOUT.seats.find((candidate) => candidate.id === seatId);
  if (!seat) {
    throw new ConvexError("Assento invalido.");
  }
  return seat;
}

/** Upsert do player no spawn do mapa — chamado uma vez ao entrar no `/dashboard`. */
export const joinWorld = mutation({
  args: { x: v.number(), y: v.number(), zoneId: v.string() },
  handler: async (ctx, { x, y, zoneId }) => {
    const userId = await requireAuthUserId(ctx);
    const existing = await getPlayerByUser(ctx, userId);
    if (existing) {
      return existing._id;
    }

    const position = clampToMap(x, y);
    return ctx.db.insert("players", {
      userId,
      ...position,
      facing: "down",
      seatId: null,
      zoneId: requireRealZone(zoneId),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Atualiza posição/direção — chamada throttled pelo client (~100-150ms).
 * `zoneId` é opcional: só envie quando o player cruzou pra uma zona diferente.
 */
export const updatePosition = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    facing,
    zoneId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const player = await getPlayerByUser(ctx, userId);
    if (!player) {
      throw new ConvexError("Jogador nao encontrado no mapa. Entre de novo.");
    }

    const position = clampToMap(args.x, args.y);

    await ctx.db.patch(player._id, {
      ...position,
      facing: args.facing,
      ...(args.zoneId ? { zoneId: requireRealZone(args.zoneId) } : {}),
      updatedAt: Date.now(),
    });
  },
});

/** Senta numa cadeira real do mapa — falha se outro player online já está sentado ali. */
export const sitDown = mutation({
  args: { seatId: v.string() },
  handler: async (ctx, { seatId }) => {
    const userId = await requireAuthUserId(ctx);
    const player = await getPlayerByUser(ctx, userId);
    if (!player) {
      throw new ConvexError("Jogador nao encontrado no mapa. Entre de novo.");
    }

    // zoneId vem do assento real, nunca do client — evita zona dessincronizada.
    const seat = getRealSeat(seatId);

    const occupant = await ctx.db
      .query("players")
      .withIndex("by_seat", (q) => q.eq("seatId", seatId))
      .unique();

    if (occupant && occupant.userId !== userId) {
      if (await isUserOnline(ctx, occupant.userId)) {
        throw new ConvexError("Essa cadeira ja esta ocupada.");
      }
      // Ocupante fantasma (offline) — libera o assento (eviction lazy, sem cron).
      await ctx.db.patch(occupant._id, { seatId: null });
    }

    await ctx.db.patch(player._id, { seatId, zoneId: seat.zoneId, updatedAt: Date.now() });
  },
});

/** Levanta da cadeira — encerra sessão de foco em andamento, se houver. */
export const standUp = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const player = await getPlayerByUser(ctx, userId);
    if (!player) {
      return;
    }

    const now = Date.now();
    if (player.focusStartedAt !== undefined) {
      await endFocusSession(ctx, player, now);
    }

    await ctx.db.patch(player._id, { seatId: null, updatedAt: now });
  },
});

/** Inicia um pomodoro (max 25min) — exige estar sentado. */
export const startFocus = mutation({
  args: { goal: v.optional(v.string()), minutes: v.number() },
  handler: async (ctx, { goal, minutes }) => {
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_FOCUS_MINUTES) {
      throw new ConvexError(`Duracao invalida (1 a ${MAX_FOCUS_MINUTES} min).`);
    }

    const trimmedGoal = goal?.trim();
    if (trimmedGoal !== undefined && trimmedGoal.length > MAX_FOCUS_GOAL_LENGTH) {
      throw new ConvexError(`Objetivo muito longo (max ${MAX_FOCUS_GOAL_LENGTH} caracteres).`);
    }

    const userId = await requireAuthUserId(ctx);
    const player = await getPlayerByUser(ctx, userId);
    if (!player || player.seatId === null) {
      throw new ConvexError("Sente numa cadeira de foco primeiro.");
    }

    const now = Date.now();
    await ctx.db.patch(player._id, {
      focusGoal: trimmedGoal && trimmedGoal.length > 0 ? trimmedGoal : undefined,
      focusStartedAt: now,
      focusUntil: now + minutes * 60_000,
      updatedAt: now,
    });
  },
});

/** Para o pomodoro atual (manual ou ao expirar) — loga a sessão em `focusSessions`. */
export const stopFocus = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const player = await getPlayerByUser(ctx, userId);
    if (!player) {
      return;
    }

    await endFocusSession(ctx, player, Date.now());
  },
});

/**
 * Jogadores online agora, no formato `Player` esperado por `WorldScene`
 * (src/features/scene). Junta `players` (durável) com `presence.listRoom`
 * (efêmero) — só quem está com conexão viva aparece no mapa dos outros.
 */
export const listPlayers = query({
  args: {},
  handler: async (ctx) => {
    const [players, presenceRows] = await Promise.all([
      ctx.db.query("players").collect(),
      presence.listRoom(ctx, OFFICE_ROOM, true),
    ]);

    const onlineUserIds = new Set(presenceRows.map((row) => row.userId));
    const onlinePlayers = players.filter((player) => onlineUserIds.has(player.userId));

    const users = await Promise.all(
      onlinePlayers.map((player) => ctx.db.get(player.userId)),
    );

    return onlinePlayers.map((player, index) => ({
      userId: player.userId,
      username: users[index]?.username ?? "???",
      x: player.x,
      y: player.y,
      facing: player.facing,
      seatId: player.seatId,
      zoneId: player.zoneId,
      isOnline: true,
      focusGoal: player.focusGoal,
      focusUntil: player.focusUntil,
    }));
  },
});

/**
 * O player do usuário autenticado (posição/assento/foco), pra resumir de
 * onde ficou ao recarregar a página — não depende de presence (o próprio
 * usuário sempre "vê" seu último estado durável, mesmo antes do heartbeat
 * confirmar a conexão como online pros outros).
 */
export const getMyPlayer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const player = await getPlayerByUser(ctx, userId);
    if (!player) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return {
      userId: player.userId,
      username: user?.username ?? "???",
      x: player.x,
      y: player.y,
      facing: player.facing,
      seatId: player.seatId,
      zoneId: player.zoneId,
      isOnline: true,
      focusGoal: player.focusGoal,
      focusUntil: player.focusUntil,
    };
  },
});
