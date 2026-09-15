import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Provider de auth do MVP: email + senha + username, sem OAuth.
 *
 * O formulário de cadastro (`flow: "signUp"`) deve enviar um campo extra
 * `username` além de `email`/`password` — ex.:
 *   signIn("password", { email, password, username, flow: "signUp" })
 *
 * O login (`flow: "signIn"`) é só por email — decisão de segurança (review
 * do John): username é só nome de exibição, nunca identifica login. Uma
 * query pra resolver username->email antes do signIn vazaria email de
 * qualquer usuário a partir do username (enumeração de PII) — removida.
 */
// Sem generic `<DataModel>`: o insert real acontece no `createOrUpdateUser`
// abaixo (não no insert automático do provider), então o retorno de
// `profile` varia por flow (username só no signUp) sem precisar bater com
// o shape estrito do documento `users`.
const PasswordProvider = Password({
  validatePasswordRequirements: (password: string) => {
    if (password.length < 8 || !/\d/.test(password)) {
      throw new ConvexError(
        "A senha precisa ter pelo menos 8 caracteres e 1 numero.",
      );
    }
  },
  // `profile` roda em TODOS os flows (signIn inclusive) — username só é
  // obrigatório no signUp; no signIn o provider usa só o email pra buscar a conta.
  profile(params) {
    const email = params.email;
    const username = params.username;

    if (typeof email !== "string" || email.trim().length === 0) {
      throw new ConvexError("Email invalido.");
    }

    if (params.flow !== "signUp") {
      // `username: ""` só satisfaz o tipo de retorno (`Value`, sem `undefined`)
      // — createOrUpdateUser nem olha pra isso quando `existingUserId` existe.
      return { email, username: "" };
    }

    if (typeof username !== "string" || !USERNAME_REGEX.test(username)) {
      throw new ConvexError(
        "Nome de usuario invalido. Use 3 a 20 letras, numeros ou _.",
      );
    }

    return { email, username };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [PasswordProvider],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const profile = args.profile as { email: string; username: string };
      const db = (ctx as MutationCtx).db;

      const existingUsername = await db
        .query("users")
        .withIndex("username", (q) => q.eq("username", profile.username))
        .unique();

      if (existingUsername) {
        throw new ConvexError("Esse nome de usuario ja existe.");
      }

      return db.insert("users", {
        email: profile.email,
        username: profile.username,
      });
    },
  },
});
