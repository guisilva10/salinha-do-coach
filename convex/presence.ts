import { Presence } from "@convex-dev/presence";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";

/**
 * Adapter fino sobre o componente `@convex-dev/presence` — só sinal efêmero
 * de "conexão viva agora", sala fixa `"office"` (mapa único, sem salas
 * separadas nesta fase). Estado durável (posição, assento, foco) vive em
 * `players` (convex/players.ts), nunca aqui.
 */
export const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: (ctx, { roomId, userId, sessionId, interval }) =>
    presence.heartbeat(ctx, roomId, userId, sessionId, interval),
});

export const list = query({
  args: { roomToken: v.string() },
  handler: (ctx, { roomToken }) => presence.list(ctx, roomToken),
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: (ctx, { sessionToken }) => presence.disconnect(ctx, sessionToken),
});
