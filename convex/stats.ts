import { query } from "./_generated/server";
import { presence } from "./presence";

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const OFFICE_ROOM = "office";

/**
 * Fonte única de verdade do contador global de foco — consumida pela
 * landing page e pelo HUD do dashboard. `liveCount` = players online e
 * sentados agora (qualquer cadeira); `weeklyTotal` = sessões de foco
 * concluídas (`focusSessions`) nos últimos 7 dias. Nunca hardcoded/fake.
 */
export const globalFocusCount = query({
  args: {},
  handler: async (ctx) => {
    const [players, presenceRows, focusSessions] = await Promise.all([
      ctx.db.query("players").collect(),
      presence.listRoom(ctx, OFFICE_ROOM, true),
      ctx.db.query("focusSessions").collect(),
    ]);

    const onlineUserIds = new Set(presenceRows.map((row) => row.userId));
    const liveCount = players.filter(
      (player) => player.seatId !== null && onlineUserIds.has(player.userId),
    ).length;

    const weekAgo = Date.now() - WEEK_IN_MS;
    const weeklyTotal = focusSessions.filter((session) => session.endedAt >= weekAgo)
      .length;

    return { liveCount, weeklyTotal };
  },
});
