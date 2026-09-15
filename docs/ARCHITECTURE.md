# Arquitetura — Salinha do Coach ("Modo Foco Coletivo")

> Documento de arquitetura executável. Autor: Willem (System Architect, 2V Educação).
> Escopo: apenas plano — nenhum código de produto foi implementado. Snippets são ilustrativos.
> Verificado em `node_modules/next/dist/docs` (Next 16.3.4 instalado neste projeto) e via Context7 (Convex, `@convex-dev/auth`, `@convex-dev/presence`) em 2026-09-11.
>
> **ATUALIZAÇÃO (Fase 2, 2026-09-11):** mudança de produto — não existem mais salas separadas, é um mapa único com zonas. As seções **2, 3, 4 e 7** abaixo descrevem o modelo antigo (N salas com cenário/layout próprio) e ficam só como histórico da Fase 1 — **ver seção 13** pro modelo real implementado.

---

## 1. Contexto

Produto: salas de coworking silencioso em tempo real. Sem chat, sem voz, sem reações — só presença ao vivo. Visual estilo Gather (mapa 2D, assentos, avatares sentados). Lobby lista salas com miniatura + contagem ao vivo de quem está dentro.

Decisões já fechadas (não rediscutidas aqui):
- Backend real-time: **Convex** + `@convex-dev/presence` (componente oficial, heartbeat)
- Auth: **Convex Auth** (`@convex-dev/auth`) desde o MVP, Google + senha opcional
- Visual: mapa 2D estilo Gather

Achado crítico de compatibilidade (verificado em `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` e `middleware.md`):

> **Next.js 16 renomeou `middleware.ts` → `proxy.ts`.** O arquivo `middleware.js|ts` está **deprecated** (não removido, mas a convenção nova é `proxy.ts` com export `proxy` no lugar de `middleware`). A funcionalidade é idêntica — só nome de arquivo e nome do export mudaram. Next disponibiliza codemod `npx @next/codemod@canary middleware-to-proxy .`

A documentação atual do `@convex-dev/auth` (verificada via Context7, `/get-convex/convex-auth`) ainda ensina `middleware.ts` com `export default convexAuthNextjsMiddleware()` — a lib **não foi atualizada pra Next 16** ainda. Como `convexAuthNextjsMiddleware(...)` apenas retorna uma função `(request, event) => Response | undefined` — a mesma assinatura que Next 16 espera pra `proxy.ts` — a adaptação é mecânica: renomear arquivo pra `proxy.ts` e exportar o resultado como `proxy` (named export) em vez de default. Ver seção 5.2 e "Riscos".

---

## 2. Modelagem (DDD)

### 2.1 Bounded contexts

| Contexto | Responsabilidade | Dono do estado |
|---|---|---|
| **Auth** | Identidade do usuário (login Google/senha) | Convex Auth (tabelas `authTables`) |
| **Rooms** | Salas, cenário, assentos, quem sentou onde (estado **durável**) | Nosso schema Convex |
| **Presence** (infra, não é domínio de negócio) | Sinal efêmero online/offline por sala | `@convex-dev/presence` (tabelas internas do componente) |

`Presence` **não é um bounded context de negócio** — é um adapter de infraestrutura que fornece um sinal (`online: boolean`) consumido pelo contexto `Rooms`. Isso é importante: não modelamos entidades de domínio dentro do componente de terceiros.

### 2.2 Regra central: estado durável vs. estado efêmero

Decisão arquitetural chave do projeto — **separar claramente**:

- **Durável (nosso domínio, fonte de verdade de negócio):** qual assento o usuário escolheu, quando entrou, meta de foco opcional. Isso precisa sobreviver a reconexões, refresh de página, e precisa ser uma entidade real (`RoomMember`) com `id`, consultável, com regras de negócio (ex: um assento só pode ter um ocupante).
- **Efêmero (infra, `@convex-dev/presence`):** "esse usuário está com uma conexão viva agora". Reconecta sozinho, expira automaticamente via *heartbeat* com TTL, não é modelado como entidade nossa.

Por que não guardar o `seatId` dentro do campo `data` (unknown) que o componente Presence aceita via `updateRoomUser`? Porque:
1. `data` é `unknown` — perderíamos type-safety em um dado crítico de negócio (violaria a regra "sem `any`/dado não tipado em fronteira").
2. O ciclo de vida de `data` é controlado pelo componente de terceiros, não pelo nosso domínio — Clean Architecture exige que regras de negócio (ex: "não pode sentar em assento ocupado por alguém online") não fiquem reféns do storage interno de uma dependência externa.
3. Presence pode ser trocado/atualizado no futuro sem afetar a entidade `RoomMember`.

### 2.3 Entidades e Value Objects (contexto `Rooms`)

```
Room (Entity, aggregate root)
├─ id: Id<"rooms">
├─ slug: RoomSlug (VO — string única, url-safe, auto-validante)
├─ name: string
├─ description: string
├─ scene: RoomScene (VO — referência do cenário/imagem de fundo)
├─ layout: SeatLayout (VO — lista imutável de assentos {seatId, x, y, label?})
└─ capacity: number (derivado de layout.seats.length)

RoomMember (Entity — não é aggregate root, vive sob Room)
├─ id: Id<"roomMembers">
├─ roomId: Id<"rooms">
├─ userId: Id<"users">
├─ seatId: SeatId (VO — deve existir em Room.layout)
├─ joinedAt: number (timestamp)
└─ focusGoal?: FocusGoal (VO — string curta, max N chars, auto-validante; opcional)

SeatId (VO) — string, imutável, validado contra layout.seats no momento da mutation
RoomSlug (VO) — kebab-case, imutável, auto-validante (regex)
FocusGoal (VO) — string 1-80 chars, trim, imutável
```

Regra de invariante do aggregate: **um `seatId` só pode ter um `RoomMember` ativo por vez dentro do mesmo `roomId`** — garantida na mutation `takeSeat` (ver 3.2), não no client.

### 2.4 O que fica em `authTables` (Convex Auth)

Convex Auth já provisiona `users`, `authAccounts`, `authSessions`, etc. via `authTables` — não remodelamos usuário aqui. `RoomMember.userId` referencia `users._id` gerado por essas tabelas.

---

## 3. Arquitetura

### 3.1 Schema Convex (`convex/schema.ts`)

```ts
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  rooms: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    sceneImageUrl: v.string(),
    layout: v.array(
      v.object({
        seatId: v.string(),
        x: v.number(),
        y: v.number(),
        label: v.optional(v.string()),
      }),
    ),
  }).index("by_slug", ["slug"]),

  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    seatId: v.string(),
    joinedAt: v.number(),
    focusGoal: v.optional(v.string()),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_seat", ["roomId", "seatId"])
    .index("by_user", ["userId"]),
});

export default schema;
```

Índices justificados:
- `by_slug`: resolver `/room/[slug]` sem scan.
- `by_room`: listar ocupantes de uma sala (mapa 2D).
- `by_room_and_seat`: checagem atômica de conflito de assento dentro da mutation `takeSeat` (equality lookup, não scan).
- `by_user`: saber se o usuário já está sentado em outra sala (pra permitir "trocar de sala" limpando o assento anterior).

`roomMembers` é a única tabela de estado durável do domínio `Rooms`. Não existe tabela `seats` separada — assentos são parte imutável do VO `layout` dentro de `rooms` (não têm ciclo de vida próprio, não são entidades).

### 3.2 Wiring do componente Presence (`convex/convex.config.ts`)

```ts
import { defineApp } from "convex/server";
import presence from "@convex-dev/presence/convex.config.js";

const app = defineApp();
app.use(presence);
export default app;
```

### 3.3 Funções Convex

**`convex/presence.ts`** — fino adapter sobre o componente (padrão oficial):

```ts
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { Presence } from "@convex-dev/presence";

const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: { roomId: v.string(), userId: v.string(), sessionId: v.string(), interval: v.number() },
  handler: (ctx, args) => presence.heartbeat(ctx, args.roomId, args.userId, args.sessionId, args.interval),
});

export const list = query({
  args: { roomToken: v.string() },
  handler: (ctx, { roomToken }) => presence.list(ctx, roomToken),
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: (ctx, { sessionToken }) => presence.disconnect(ctx, sessionToken),
});
```

API real do componente (verificada no source, `src/component/public.ts`) inclui também `listRoom({roomId, onlineOnly?, limit?})` e `listUser({userId, onlineOnly?, limit?})` — **estas não exigem `roomToken` de sessão**, podem ser chamadas por qualquer query/mutation nossa server-side. Isso é o que torna possível resolver contagem ao vivo e liberação de assento sem depender do client (ver 3.5).

**`convex/rooms.ts`** — camada de aplicação (use cases) do contexto `Rooms`:

| Função | Tipo | Descrição |
|---|---|---|
| `listRooms` | query | Lista salas + contagem ao vivo (via `presence.listRoom`, `onlineOnly: true`, por sala) |
| `getRoomBySlug` | query | Sala + `layout` + ocupantes (`roomMembers` por `by_room`) mesclados com presença online |
| `takeSeat` | mutation | Ver 3.4 — lógica de conflito/eviction |
| `leaveSeat` | mutation | Remove o `roomMember` do usuário autenticado na sala atual |
| `updateFocusGoal` | mutation | Atualiza `focusGoal` do `roomMember` ativo (opcional, fase 3) |

```ts
// convex/rooms.ts — assinatura ilustrativa das queries de listagem
export const listRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("rooms").collect();
    return Promise.all(
      rooms.map(async (room) => ({
        ...room,
        liveCount: (
          await presence.listRoom(ctx, { roomId: room._id, onlineOnly: true })
        ).length,
      })),
    );
  },
});
```

### 3.4 `takeSeat` — conflito e eviction de assento fantasma

Regra de negócio central do MVP: assento ocupado por alguém **offline** pode ser tomado por outra pessoa; assento ocupado por alguém **online** não pode.

```ts
export const takeSeat = mutation({
  args: { roomId: v.id("rooms"), seatId: v.string() },
  handler: async (ctx, { roomId, seatId }) => {
    const userId = await getAuthUserId(ctx); // @convex-dev/auth/server
    if (!userId) throw new Error("Not authenticated");

    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");
    if (!room.layout.some((s) => s.seatId === seatId)) {
      throw new Error("Seat does not exist in this room layout");
    }

    const existingOccupant = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_seat", (q) => q.eq("roomId", roomId).eq("seatId", seatId))
      .unique();

    if (existingOccupant && existingOccupant.userId !== userId) {
      const [presenceRow] = await presence.listRoom(ctx, {
        roomId: roomId as unknown as string,
        onlineOnly: false,
      }).then((rows) => rows.filter((r) => r.userId === existingOccupant.userId));

      if (presenceRow?.online) {
        throw new Error("Seat is taken");
      }
      // ocupante offline → evict e libera o assento
      await ctx.db.delete(existingOccupant._id);
    }

    // libera assento anterior do próprio usuário nesta sala, se houver
    const ownPreviousSeat = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (ownPreviousSeat) await ctx.db.delete(ownPreviousSeat._id);

    await ctx.db.insert("roomMembers", { roomId, userId, seatId, joinedAt: Date.now() });
  },
});
```

Isso elimina a necessidade de **cron job** para liberar assentos fantasma no MVP (evolução em camadas: adicionar cron de "sweep" periódico só se, na prática, sobrarem muitos assentos fantasma visíveis por muito tempo sem ninguém tentar sentar — fase 3+, não fase 1/2. YAGNI).

### 3.5 Fluxo de dados (sequência — entrar numa sala)

```
Client (RoomPage)                     Convex
      │                                  │
      │  usePresence(api.presence,       │  heartbeat() a cada N s
      │  roomId, userId) ───────────────►│  (gerencia sessionId/roomToken
      │◄─────────────────────────────────│   internamente, expira via TTL)
      │                                  │
      │  useQuery(api.rooms.getRoomBySlug)
      │─────────────────────────────────►│  join: roomMembers (durável)
      │◄─────────────────────────────────│      + presence.listRoom (efêmero)
      │  render: layout + avatares nos   │
      │  assentos ocupados por gente     │
      │  online                          │
      │                                  │
      │  click num assento vazio         │
      │  useMutation(api.rooms.takeSeat) │
      │─────────────────────────────────►│  valida + evict fantasma + insert
      │◄─────────────────────────────────│  (reativo: todo mundo na sala
      │  UI atualiza via subscription    │   vê o novo ocupante instantaneamente)
```

---

## 4. Estrutura de Pastas (DDD Modular 2V)

```
src/
├── app/
│   ├── page.tsx                      # landing + login (Server Component)
│   ├── layout.tsx                    # RootLayout + ConvexClientProvider
│   ├── lobby/
│   │   └── page.tsx                  # lista de salas (Server Component shell)
│   └── room/
│       └── [slug]/
│           └── page.tsx              # mapa 2D da sala
│
├── features/
│   ├── auth/
│   │   ├── domain/                   # (mínimo — Convex Auth cobre a maior parte)
│   │   ├── application/              # useSignIn, useCurrentUser (hooks de orquestração)
│   │   ├── infrastructure/
│   │   │   └── convex-auth-client.ts # wrapper fino sobre useAuthActions
│   │   └── presentation/
│   │       ├── sign-in-button.tsx
│   │       └── auth-guard.tsx
│   │
│   └── rooms/
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── room.ts           # tipo Room + invariantes (capacity = layout.length)
│       │   │   └── room-member.ts    # tipo RoomMember
│       │   ├── value-objects/
│       │   │   ├── room-slug.ts      # validação/normalização
│       │   │   ├── seat-id.ts
│       │   │   └── focus-goal.ts
│       │   └── repositories/
│       │       └── room-repository.ts # interface (port) — implementada em infra
│       ├── application/
│       │   ├── use-cases/
│       │   │   ├── list-rooms.ts     # orquestra query + mapeia pra DTO de UI
│       │   │   ├── take-seat.ts
│       │   │   └── leave-seat.ts
│       │   └── dtos/
│       │       ├── room-summary.dto.ts   # { slug, name, liveCount, thumbnailUrl }
│       │       └── room-detail.dto.ts    # { room, occupants: OccupantDto[] }
│       ├── infrastructure/
│       │   ├── convex-room-repository.ts # implementa room-repository.ts via api.rooms.*
│       │   └── presence-adapter.ts       # wrapper sobre usePresence (isola o componente 3rd-party)
│       └── presentation/
│           ├── hooks/
│           │   ├── use-room-list.ts
│           │   └── use-room-presence.ts
│           └── components/
│               ├── room-lobby-grid.tsx
│               ├── room-card.tsx         # thumbnail + contagem ao vivo + FOMO
│               ├── room-scene.tsx        # canvas do mapa 2D
│               ├── seat.tsx              # assento clicável
│               └── avatar-on-seat.tsx
│
├── shared/
│   ├── domain/
│   │   └── entity.ts                 # base id-bearing entity type (opcional)
│   └── ui/                           # shadcn/ui compartilhado
│
└── lib/
    └── convex-client.ts              # ConvexReactClient singleton (usado no provider)

convex/
├── convex.config.ts                  # app.use(presence)
├── schema.ts
├── auth.ts                           # convexAuth({ providers: [Google, Password?] })
├── auth.config.ts
├── presence.ts                       # adapter fino do componente (heartbeat/list/disconnect)
├── rooms.ts                          # listRooms, getRoomBySlug, takeSeat, leaveSeat
└── http.ts                           # rotas OAuth callback (exigido por Convex Auth)

proxy.ts                              # substitui middleware.ts (Next 16) — ver seção 5.2
```

Nota: código de domínio (`features/rooms/domain`) **não importa** `convex/_generated/api` nem hooks do React — isso vive em `infrastructure/`. `application/use-cases` depende da interface `room-repository.ts` (port), não da implementação Convex — inversão de dependência real, não decorativa.

---

## 5. Contratos

### 5.1 Port do domínio (`features/rooms/domain/repositories/room-repository.ts`)

```ts
import type { Room } from "../entities/room";
import type { RoomMember } from "../entities/room-member";

export interface RoomRepository {
  listRooms(): Promise<Array<Room & { liveCount: number }>>;
  getRoomBySlug(slug: string): Promise<{
    room: Room;
    occupants: Array<RoomMember & { online: boolean }>;
  } | null>;
  takeSeat(roomId: string, seatId: string): Promise<void>;
  leaveSeat(roomId: string): Promise<void>;
}
```

A implementação (`convex-room-repository.ts`) usa `useQuery(api.rooms.*)`/`useMutation(api.rooms.*)` internamente. Trocar Convex por outro backend no futuro exigiria reescrever só esse arquivo — o resto do domínio/aplicação não muda (é o ponto do padrão hexagonal aqui).

### 5.2 `proxy.ts` — adaptação de `@convex-dev/auth` pro Next 16

```ts
// proxy.ts (raiz do projeto, ao lado de src/)
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/lobby(.*)", "/room(.*)"]);

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

Diferença em relação ao exemplo oficial (que ainda documenta `middleware.ts` com `export default`): arquivo renomeado, export nomeado `proxy` em vez de default. **Isso deve ser validado manualmente no início da Fase 1** (rodar `npx convex dev` + `pnpm dev` e confirmar que o redirect de rota protegida funciona) — é uma adaptação não documentada oficialmente ainda pela lib, embora consistente com a nota da Next ("funcionalidade idêntica, só nome mudou"). Ver seção "Riscos".

A doc do Next 16 (`app/guides/authentication#optimistic-checks-with-proxy-optional`) reforça: Proxy é só para **checagem otimista** (UX rápida de redirect) — a autorização real precisa ser verificada de novo em cada mutation/query Convex via `getAuthUserId(ctx)` (já é o padrão do exemplo `takeSeat` acima) e, se houver Server Actions/Server Components lendo dados sensíveis, via `convexAuthNextjsToken()`.

### 5.3 DTOs de UI

```ts
// features/rooms/application/dtos/room-summary.dto.ts
export type RoomSummaryDto = {
  slug: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  capacity: number;
  liveCount: number; // pra badge "3 pessoas focando agora" (FOMO)
};

// features/rooms/application/dtos/room-detail.dto.ts
export type OccupantDto = {
  seatId: string;
  userId: string;
  userName: string;
  online: boolean;
  focusGoal?: string;
};

export type RoomDetailDto = {
  slug: string;
  name: string;
  sceneImageUrl: string;
  layout: Array<{ seatId: string; x: number; y: number; label?: string }>;
  occupants: OccupantDto[];
};
```

---

## 6. Rotas Next.js

| Rota | Tipo | Proteção | Conteúdo |
|---|---|---|---|
| `/` | Server Component | Pública | Landing + botão "Entrar com Google" (redireciona pro lobby se já autenticado) |
| `/lobby` | Server Component shell + Client islands | `proxy.ts` (otimista) | Grid de `RoomCard` com contagem ao vivo |
| `/room/[slug]` | Server Component shell + Client island (mapa) | `proxy.ts` (otimista) | Cenário 2D + assentos + avatares |

Todas as leituras/escritas de dados de negócio acontecem via hooks Convex reativos no client (`useQuery`/`useMutation`) — não via Server Components com `fetchQuery`, porque o produto é fundamentalmente tempo-real (presença, ocupação de assento mudando o tempo todo). Server Components aqui servem só de shell/layout/SEO da landing, não de data-fetching primário. Isso é uma escolha deliberada: forçar RSC pra dados que mudam a cada segundo geraria over-fetching e complexidade sem ganho (Next não tem realtime nativo em RSC).

---

## 7. Render do mapa 2D — recomendação

**Recomendação: DOM absoluto posicionado com Tailwind, não canvas nem SVG.**

Justificativa:
- **Canvas**: exigiria reimplementar hit-testing de clique, acessibilidade (foco de teclado, `aria-label` por assento), e toda a camada de estado React precisaria de uma ponte manual (`ref` + imperative draw loop). Complexidade desproporcional pro escopo (assentos estáticos, sem física, sem animação de movimento livre).
- **SVG**: viável, mas adiciona uma camada de coordenadas própria (viewBox) e não ganha nada sobre DOM absoluto quando os elementos são só imagens de fundo + botões posicionados — SVG faria sentido se os assentos fossem formas vetoriais desenhadas por nós, o que não é o caso (cenário é uma imagem ilustrada).
- **DOM absoluto**: cada assento é literalmente um `<button>` posicionado com `style={{ left: x%, top: y% }}` sobre uma `<img>` de cenário com `position: relative`. Isso dá de graça: acessibilidade (`<button>` real, focável, `aria-label="Assento 3, ocupado por Ana"`), hit area de 44x44px fácil de garantir, hover/focus states via CSS, e zero código de rendering customizado — só JSX + Tailwind. Alinha 100% com a regra 2V de "libs consolidadas, não reimplementar" e "simplicidade first".

```tsx
// features/rooms/presentation/components/room-scene.tsx — ilustrativo
<div className="relative aspect-video w-full overflow-hidden rounded-lg">
  <Image src={sceneImageUrl} alt="" fill className="object-cover" aria-hidden />
  {layout.map((seat) => {
    const occupant = occupants.find((o) => o.seatId === seat.seatId);
    return (
      <Seat
        key={seat.seatId}
        style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
        occupant={occupant}
        onClick={() => takeSeat(seat.seatId)}
      />
    );
  })}
</div>
```

Coordenadas `x`/`y` em **percentual** (0-100), não pixel absoluto — assim o layout escala com qualquer tamanho de tela sem recalcular nada (mobile-first: o cenário encolhe, os assentos acompanham proporcionalmente).

Layout de sala = JSON estático dentro de `rooms.layout` (schema acima), editado via seed/script — não precisa de editor visual no MVP (YAGNI).

---

## 8. Ordem de implementação em camadas

### Fase 1 — Auth + Lobby funcional ponta a ponta
- Setup Convex (`npx convex dev`), `@convex-dev/auth` (`npx @convex-dev/auth`), schema com `authTables` + `rooms` (sem `roomMembers` ainda)
- `proxy.ts` com checagem otimista (seção 5.2) — **validar que funciona no Next 16 antes de seguir**
- Seed de 2-3 salas (mutation ou script one-off, não UI de criação)
- `/` (login Google) → `/lobby` (grid de salas com `capacity`, sem `liveCount` ainda — hardcode 0 ou omitir badge)
- **Critério de "pronto"**: login funciona, lobby lista salas reais do Convex, rota protegida redireciona sem sessão.

### Fase 2 — Sala com mapa, assentos e presença ao vivo
- Adiciona `roomMembers` ao schema + `convex/presence.ts` + wiring do componente
- `takeSeat`/`leaveSeat` com lógica de conflito/eviction (seção 3.4)
- `/room/[slug]` com `RoomScene` (DOM absoluto) + `usePresence` pro sinal online
- Lobby atualiza `liveCount` via `presence.listRoom`
- Sair da sala: mutation explícita no unmount + listener `visibilitychange`/`beforeunload` (best-effort) — a eviction lazy em `takeSeat` cobre o caso de conexão perdida sem esse evento disparar
- **Critério de "pronto"**: dois usuários em abas diferentes veem um ao outro sentar/levantar em tempo real; fechar aba libera o assento (imediatamente via evento, ou na próxima tentativa de outro usuário sentar ali).

### Fase 3 — Polish e FOMO (sem chat/voz)
- Badge "X pessoas focando agora" no lobby e dentro da sala (já vem de `liveCount`/`listRoom`, é só UI)
- `focusGoal` opcional ("no que você tá focando?") exibido como tooltip no avatar
- Loading/empty states, skeleton no lobby, toast ao entrar/sair de assento
- Opcional, avaliar necessidade real antes de construir: streak de dias consecutivos (exigiria nova tabela `focusStreaks` — só entra se validado que agrega valor, não é requisito fechado)

---

## 9. Env vars necessárias

**Convex (via `npx convex env set` ou dashboard, nunca `.env` commitado):**
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `JWT_PRIVATE_KEY` (gerado automaticamente pelo `npx @convex-dev/auth`)
- `JWKS` (idem)
- `SITE_URL` (URL de produção do Next, pro redirect do OAuth)

**Next.js (`.env.local`, não commitado):**
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT` (gerenciado pelo `npx convex dev`)

**Google Cloud Console:**
- Authorized redirect URI: `https://<deployment>.convex.site/api/auth/callback/google`

---

## 10. Riscos e dúvidas em aberto

| # | Risco/Dúvida | Mitigação recomendada |
|---|---|---|
| 1 | `@convex-dev/auth` ainda documenta `middleware.ts`/`export default`, não `proxy.ts`/`export proxy` — comportamento em Next 16 não testado pela própria lib | Validar manualmente na Fase 1 (primeiro item do checklist). Se `proxy.ts` não disparar corretamente, fallback documentado: manter `middleware.ts` mesmo deprecated (Next 16 ainda o executa, só não é mais a convenção recomendada) até a lib atualizar — decisão temporária aceitável aqui porque é limitação de terceiro, não nossa, mas revisar a cada minor do Next/`@convex-dev/auth` |
| 2 | Exatidão dos campos retornados por `presence.list`/`listRoom` (`{userId, online, lastDisconnected, data?}`) foi confirmada via source no GitHub, não via `node_modules` instalado (pacote ainda não adicionado ao projeto) | Antes de codar, Lorraine deve conferir os `.d.ts` reais em `node_modules/@convex-dev/presence` após `pnpm add`, já que Context7 não tinha essa lib indexada com granularidade de tipos |
| 3 | Intervalo de heartbeat (`interval` passado pro `presence.heartbeat`) afeta diretamente a velocidade de detecção de "assento fantasma" em `takeSeat` — intervalo muito longo deixa avatar "online" por mais tempo após fechar aba | Começar com intervalo curto (ex: 10s) sugerido pelos exemplos oficiais do componente; ajustar com base em custo de escrita (cada heartbeat é uma mutation) vs. responsividade percebida |
| 4 | `takeSeat` faz eviction lazy (só libera assento fantasma quando alguém tenta sentar nele) — se ninguém tentar, o assento parece ocupado indefinidamente pra quem só está olhando o mapa, sem sentar | Aceitável pro MVP (produto ainda funciona: quem quer sentar sempre consegue). Se virar reclamação recorrente, adicionar cron leve (`crons.ts`, `presence.listRoom` por sala) na Fase 3 — não construir preventivamente (YAGNI) |
| 5 | Multi-tab: mesmo usuário abre a sala em duas abas → dois `sessionId` de presence, mas só um `roomMember` (nossa entidade é por `userId`, não por sessão) | Comportamento esperado e correto: a segunda aba não pode tomar um segundo assento pro mesmo usuário (bloqueado pela lógica "libera assento anterior do próprio usuário" em `takeSeat`) — mas validar UX (a aba antiga precisa refletir reativamente que perdeu o assento, o que já acontece via subscription do Convex) |
| 6 | `next.config.ts` já tem `reactCompiler: true` — Convex hooks (`useQuery`/`useMutation`) são compatíveis, mas nenhum teste foi feito ainda com React Compiler + Convex React nesta versão exata | Rodar `pnpm build` no fim da Fase 1 e observar por warnings do compiler sobre os hooks do Convex antes de escalar pras fases seguintes |

---

## 11. Trade-offs

| Decisão | Ganha | Perde |
|---|---|---|
| Separar `roomMembers` (durável) de Presence (efêmero) em vez de guardar `seatId` dentro de `presence.data` | Type-safety, domínio não acoplado a schema interno de terceiro, testável isoladamente | Duas fontes de dado pra mesclar no client (leve overhead de leitura, mitigado por índices) |
| Eviction lazy em `takeSeat` em vez de cron de sweep | Menos infraestrutura, menos superfície de bug, YAGNI respeitado | Assento fantasma pode "parecer" ocupado por tempo indefinido se ninguém tentar sentar |
| DOM absoluto em vez de Canvas/SVG pro mapa 2D | Acessibilidade e hit-testing de graça, zero lib nova, dev velocity alta | Não escala pra cenários com centenas de elementos interativos simultâneos (não é o caso aqui — MVP tem poucos assentos por sala) |
| Server Components só como shell, dados via Convex hooks reativos no client | Realtime correto sem gambiarra de revalidação manual | Menos "SEO-friendly" pro conteúdo dinâmico do lobby/sala (aceitável — não é conteúdo indexável relevante) |
| `proxy.ts` com checagem otimista + verificação real em cada mutation | Simplicidade (não duplicamos regras de autorização em múltiplas camadas) | Se `proxy.ts` falhar silenciosamente por causa do risco #1, a única rede de segurança real é a checagem `getAuthUserId` dentro de cada função Convex — que já é obrigatória de qualquer forma |

---

## 12. Comandos

```bash
pnpm add convex @convex-dev/auth @convex-dev/presence @auth/core
npx convex dev              # inicializa deployment dev, gera convex/_generated
npx @convex-dev/auth        # setup interativo: gera JWT_PRIVATE_KEY/JWKS, cria convex/auth.ts
npx convex env set AUTH_GOOGLE_ID <id>
npx convex env set AUTH_GOOGLE_SECRET <secret>
pnpm dev                    # Next dev server
pnpm build                  # obrigatório antes de qualquer commit (DoD 2V)
```

---

## 13. Fase 2 — Mapa único (mudança de produto)

> Adendo de Lorraine, 2026-09-11. **Substitui** o modelo de "N salas separadas" das seções 2, 3, 4 e 7 acima — mantidas só como histórico da Fase 1, não descrevem mais o produto real. Decisão do usuário: não existem mais salas independentes; é **um mapa único** (escritório) com **zonas** dentro dele.

### 13.1 O que mudou

- **Mapa**: `src/features/scene` (dono: Pixi) — 1 `WorldLayout` estático (`OFFICE_LAYOUT`, `src/features/scene/domain/layouts/office.ts`), renderizado em PixiJS (`WorldScene`/`LazyWorldScene`). 4 zonas: `library`, `cafe`, `studio`, `reception`. Avatar anda livre (WASD/setas), câmera segue, colisão por tile.
- **Salas → Zonas**: a tabela `rooms` (Convex) deixou de representar salas com cenário/layout próprios — agora é o catálogo de **zonas** (nome, descrição, capacidade), consumido só pra UI de vitrine (landing, se aplicável). `slug` == `Zone.id` do mapa. Campos antigos (`sceneTemplate`, `sceneImageUrl`, `layout`) foram removidos — sem esse dado, sem backward compat.
- **Presença ao vivo real**: `@convex-dev/presence` finalmente wireado (`convex/convex.config.ts` + `convex/presence.ts`), sala fixa `"office"` — antes (Fase 1) isso tinha sido propositalmente adiado (YAGNI, sem seat-taking ainda). Agora existe.
- **Estado durável do jogador**: nova tabela `players` (posição, direção, assento, zona, foco) — substitui `roomMembers` (removida do schema).
- **Sessões de foco**: nova tabela `focusSessions` (histórico) — alimenta o `weeklyTotal` do contador global honesto.

### 13.2 Schema (`convex/schema.ts`)

```ts
rooms: defineTable({           // catálogo de zonas, não mais salas com cenário
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  capacity: v.number(),
}).index("by_slug", ["slug"]),

players: defineTable({
  userId: v.id("users"),
  x: v.number(),
  y: v.number(),
  facing: v.union(v.literal("up"), v.literal("down"), v.literal("left"), v.literal("right")),
  seatId: v.union(v.string(), v.null()),
  zoneId: v.string(),
  focusGoal: v.optional(v.string()),
  focusStartedAt: v.optional(v.number()),  // extra vs. spec original — necessário pra logar focusSessions com startedAt real
  focusUntil: v.optional(v.number()),
  updatedAt: v.number(),
}).index("by_user", ["userId"]).index("by_seat", ["seatId"]),

focusSessions: defineTable({
  userId: v.id("users"),
  zoneId: v.string(),
  startedAt: v.number(),
  endedAt: v.number(),
  minutes: v.number(),
}).index("by_user", ["userId"]),
```

### 13.3 Funções Convex

| Arquivo | Função | Tipo | Descrição |
|---|---|---|---|
| `convex/presence.ts` | `heartbeat`, `list`, `disconnect` | mutation/query | Adapter fino sobre `@convex-dev/presence`, sala fixa `"office"` |
| `convex/players.ts` | `joinWorld` | mutation | Upsert do player no spawn (`getSpawnPosition(OFFICE_LAYOUT)`) — idempotente, não reseta quem já existe |
| `convex/players.ts` | `updatePosition` | mutation | Posição/direção, throttled pelo client (~120ms); `zoneId` só quando muda de zona |
| `convex/players.ts` | `sitDown` | mutation | Valida conflito de assento (evict lazy de ocupante offline, igual ao padrão da Fase 1 — sem cron) |
| `convex/players.ts` | `standUp` | mutation | Levanta; encerra sessão de foco em andamento (loga em `focusSessions`) |
| `convex/players.ts` | `startFocus` | mutation | Pomodoro max 25min — exige estar sentado (não valida `kind` do seat server-side, ver 13.5) |
| `convex/players.ts` | `stopFocus` | mutation | Para o pomodoro (manual ou expirado) — loga a sessão |
| `convex/players.ts` | `listPlayers` | query | Players online (junta `players` + `presence.listRoom`) no shape `Player` do `WorldScene` |
| `convex/players.ts` | `getMyPlayer` | query | Player do usuário autenticado — resume posição/assento ao recarregar |
| `convex/rooms.ts` | `listRoomsWithOccupancy` | query | Zonas + ocupação real (players online por `zoneId`) — **contrato mudou**: sem `template`/`sceneImageUrl` |
| `convex/stats.ts` | `globalFocusCount` | query | `liveCount` = online e sentados; `weeklyTotal` = `focusSessions` concluídas nos últimos 7 dias |
| `convex/init.ts` | `seedRooms` | mutation | Seed das zonas — capacidade derivada de `OFFICE_LAYOUT.seats` (nunca hardcoded, sempre em sync com o mapa) |

### 13.4 Frontend (`src/features/world`)

Absorveu `src/features/rooms` (removida). Estrutura:

```
src/features/world/
├── domain/entities/world-player.ts   # Player (scene) & zoneId — extensão só nossa
├── infrastructure/convex-world-repository.ts  # hooks finos useQuery/useMutation
└── presentation/
    ├── hooks/
    │   ├── use-me.ts            # player local + auto-join no spawn
    │   ├── use-players.ts       # players online + spriteVariant
    │   ├── use-world-actions.ts # move (throttle 120ms) / sit / stand / startFocus / stopFocus + heartbeat (usePresence)
    │   ├── use-focus-stats.ts
    │   └── use-event-feed.ts    # feed "entrou"/"saiu"/"começou foco" via diff de snapshots, sonner
    └── components/
        ├── dashboard-world.tsx      # orquestra tudo, montado só quando `me` está pronto
        ├── world-corner-hud.tsx     # canto inferior direito: contador + sair
        ├── online-people-panel.tsx  # canto superior esquerdo: quem está online, colapsável
        ├── seat-list-fallback.tsx   # Sheet — fallback de acessibilidade pra sentar via teclado
        ├── focus-dialog.tsx         # abre ao sentar em cadeira "focus"
        ├── focus-hud.tsx            # timer do próprio pomodoro
        ├── lofi-player.tsx          # play/pause/volume, só em cadeira "lofi" — áudio ainda não adicionado, ver public/audio/LICENSE.txt
        └── live-dot.tsx / focus-counter.tsx
```

`/dashboard` (`src/app/(app)/dashboard/page.tsx` + `layout.tsx`) é **tela cheia**, sem header — o mapa (`LazyWorldScene`) ocupa a viewport, tudo mais é HUD `position: fixed` sobreposto.

### 13.5 Decisões e simplificações conscientes

| Decisão | Por quê |
|---|---|
| Sem cron de cleanup de assento/foco fantasma | Eviction lazy em `sitDown` já resolve o conflito de assento (mesmo padrão da Fase 1); `listPlayers` só mostra quem está online via presence, então foco de gente offline nunca aparece pros outros mesmo sem cleanup do doc. Cron fica pra depois, se necessário (YAGNI) |
| `startFocus` não valida `seat.kind === "focus"` no backend | `kind` do assento é dado do mapa (`src/features/scene`, client-side), não duplicado no Convex — o gate é só de UI (dialog só abre em cadeira `focus`). Duplicar essa validação no backend exigiria sincronizar o layout do mapa pro Convex, complexidade desproporcional pro risco (não é dado sensível/de segurança) |
| `players.zoneId` existe na tabela mas não faz parte do `Player` enviado pro `WorldScene` | `Player` (contrato do Pixi) não tem `zoneId` — é derivável de x/y via `getPlayerZone`. Mantemos `zoneId` só na tabela (pra `listRoomsWithOccupancy`/stats) e numa extensão local (`WorldPlayer`) pros componentes de HUD que precisam exibir zona sem recalcular |
| `focusStartedAt` extra no schema (não estava no pedido original) | `focusSessions` precisa de um `startedAt` real pra logar duração — sem esse campo não dava pra calcular minutos corretamente ao parar antes do tempo |
| Áudio do `LofiPlayer` não incluído | Sem fonte verificada de faixas CC0/CC-BY baixável nesta sessão sem risco de licença — playlist configurável + placeholder gracioso, ver `public/audio/LICENSE.txt` |
