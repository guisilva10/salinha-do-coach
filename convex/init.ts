import { mutation } from "./_generated/server";
import { OFFICE_LAYOUT, OFFICE_ZONES } from "../src/features/scene/domain/layouts/office";

const ZONE_DESCRIPTIONS: Record<string, string> = {
  library: "Maioria de cadeiras de foco — mesas individuais silenciosas.",
  cafe: "Clima de café de madrugada — maioria das mesas toca lofi.",
  studio: "Mix de assentos comuns, foco e lofi.",
  reception: "Só assentos comuns — ponto de encontro e passagem.",
};

/**
 * Seed one-off das zonas do mapa único (`OFFICE_ZONES`, dono: Pixi em
 * `src/features/scene`). Capacidade é derivada da contagem real de seats
 * por zona no layout — nunca duplicada/hardcoded, sempre em sincronia com
 * `office.ts`. Idempotente — não duplica se as zonas já existirem.
 */
export const seedRooms = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("rooms").collect();
    if (existing.length > 0) {
      return { seeded: 0, skipped: existing.length };
    }

    for (const zone of OFFICE_ZONES) {
      const capacity = OFFICE_LAYOUT.seats.filter((seat) => seat.zoneId === zone.id).length;
      await ctx.db.insert("rooms", {
        slug: zone.id,
        name: zone.name,
        description: ZONE_DESCRIPTIONS[zone.id] ?? "",
        capacity,
      });
    }

    return { seeded: OFFICE_ZONES.length, skipped: 0 };
  },
});
