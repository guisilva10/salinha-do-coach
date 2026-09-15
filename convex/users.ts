import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

const USERNAME_MIN_LENGTH = 3;

/**
 * Checagem assincrona de disponibilidade de username (onBlur, debounced no
 * client). Exige min length pra não virar oracle barato de enumeração —
 * abaixo do mínimo válido nem consulta o banco.
 */
export const isUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    if (username.length < USERNAME_MIN_LENGTH) {
      return false;
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", username))
      .unique();
    return existing === null;
  },
});

/** Usuário autenticado atual — usado no header do dashboard (username, sair). */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return ctx.db.get(userId);
  },
});
