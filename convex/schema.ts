import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const facing = v.union(
  v.literal("up"),
  v.literal("down"),
  v.literal("left"),
  v.literal("right"),
);

const schema = defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    username: v.string(),
  })
    .index("email", ["email"])
    .index("username", ["username"]),

  /**
   * Fase 2: não existem mais salas separadas — é um mapa único
   * (`src/features/scene`, dono: Pixi) com zonas. Esta tabela é o catálogo
   * de zonas (nome/descrição/capacidade) consumido pela landing page e pelo
   * dashboard via `rooms.listRoomsWithOccupancy` — mantido com esse nome
   * pra não quebrar o contrato já usado pela LP. `slug` == `Zone.id` do
   * layout do mapa (`src/features/scene/domain/world-layout.ts`).
   */
  rooms: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    capacity: v.number(),
  }).index("by_slug", ["slug"]),

  /**
   * Estado durável de cada jogador no mapa único. Posição/assento/foco —
   * tudo aqui é fonte de verdade; `@convex-dev/presence` (convex/presence.ts)
   * só sabe dizer "esse userId está com uma conexão viva agora" (sinal
   * efêmero, sala fixa `"office"`), nunca guarda posição/assento.
   */
  players: defineTable({
    userId: v.id("users"),
    x: v.number(),
    y: v.number(),
    facing,
    /** `null` = de pé, andando. Setado = sentado nessa cadeira, x/y ignorados no client. */
    seatId: v.union(v.string(), v.null()),
    zoneId: v.string(),
    focusGoal: v.optional(v.string()),
    /** Epoch ms do início do pomodoro atual — usado pra logar `focusSessions` ao parar/expirar. */
    focusStartedAt: v.optional(v.number()),
    /** Epoch ms do fim do pomodoro atual (max 25min de duração). */
    focusUntil: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_seat", ["seatId"]),

  /** Histórico de sessões de foco concluídas — alimenta o "weeklyTotal" honesto do FOMO. */
  focusSessions: defineTable({
    userId: v.id("users"),
    zoneId: v.string(),
    startedAt: v.number(),
    endedAt: v.number(),
    minutes: v.number(),
  }).index("by_user", ["userId"]),
});

export default schema;
