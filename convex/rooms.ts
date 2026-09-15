import { query } from "./_generated/server";
import { presence } from "./presence";

const OFFICE_ROOM = "office";

/**
 * Lista as zonas do mapa único com ocupação ao vivo real — fonte única de
 * verdade consumida pela landing page (vitrine de zonas) e, se necessário,
 * pelo dashboard. `liveCount` conta players online (`@convex-dev/presence`)
 * cujo `zoneId` atual é o da zona. Nunca hardcoded/fake.
 *
 * NOTA pra quem consome (Lais): não existem mais templates de cenário por
 * sala (`template`/`sceneImageUrl` saíram do contrato) — é um mapa único
 * (`src/features/scene`) com zonas dentro dele. Componentes que ainda
 * esperam `template`/`seats` por sala precisam ser repensados pra essa
 * mudança de produto.
 */
export const listRoomsWithOccupancy = query({
  args: {},
  handler: async (ctx) => {
    const zones = await ctx.db.query("rooms").collect();
    const [players, presenceRows] = await Promise.all([
      ctx.db.query("players").collect(),
      presence.listRoom(ctx, OFFICE_ROOM, true),
    ]);

    const onlineUserIds = new Set(presenceRows.map((row) => row.userId));
    const onlinePlayers = players.filter((player) => onlineUserIds.has(player.userId));

    return zones.map((zone) => ({
      id: zone.slug,
      slug: zone.slug,
      name: zone.name,
      description: zone.description,
      capacity: zone.capacity,
      liveCount: onlinePlayers.filter((player) => player.zoneId === zone.slug).length,
    }));
  },
});
