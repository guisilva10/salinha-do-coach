# Salinha do Coach

Modo Foco Coletivo: escritório virtual pixel art (estilo Gather) onde pessoas entram pra trabalhar em silêncio, juntas. Sem chat, sem voz — só presença ao vivo, cadeiras com modo foco (pomodoro ≤ 25 min) ou lofi.

## Stack
- Next.js 16 (App Router, `src/proxy.ts` no lugar de middleware) + React 19 + React Compiler + TypeScript
- Tailwind v4 + shadcn v4 (Base UI) — tema tweakcn P&B monocromático em `src/app/globals.css`, fonte Nunito, `next-themes`
- Convex (DB + realtime) + Convex Auth (Password: email + senha; `username` = nome exibido) + `@convex-dev/presence`
- PixiJS v8 + `@pixi/react` v8 (cena 2D, assets CC0 Kenney em `public/sprites`)
- pnpm

## Estrutura
```
convex/                 schema, auth, players (posição/assento/foco), rooms (zonas), stats, presence
src/app/                / (LP) · (auth)/login,cadastro · (app)/dashboard (mapa tela cheia) · (legal)
src/features/auth       forms + schemas Zod
src/features/landing    seções da LP
src/features/world      domínio do jogador, hooks Convex, HUD, FocusDialog, LofiPlayer
src/features/scene      motor Pixi: layout do escritório, movimento, câmera, sprites (shared kernel — world e landing podem importar)
src/shared/ui           ThemeProvider/Toggle, LiveDot
src/components/ui       shadcn
docs/                   ARCHITECTURE.md (§13 = estado atual), DESIGN_DIRECTION.md, design-ref/gather.town
```

## Env
`.env.local`: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`
Convex deployment: `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` (setar via `npx convex env set`)

## Comandos
`pnpm dev` · `npx convex dev` (paralelo) · `pnpm build` · `pnpm lint` · `npx tsc --noEmit` · `npx convex run init:seedRooms`

## Decisões
- Mapa único com zonas (recepção, biblioteca, café, estúdio) — sem lista de salas. `rooms` = zonas pra stats
- Posição sincronizada via mutation throttled (120ms); presence só online/offline; assento liberado lazy no `sitDown`
- `profile()` do Password roda em todo flow — username só validado no signUp
- `features/scene` é shared kernel presentational (só props, zero Convex)
- Sem cor de acento — P&B; cena pixel art pode ter cor contida
- Backlog pós-MVP: customizar avatar/mesa, faixas lofi licenciadas, walk-to-seat
