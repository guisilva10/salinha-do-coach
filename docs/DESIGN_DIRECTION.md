# Design Direction — Salinha do Coach (Modo Foco Coletivo)

> Autora: Lais (UX/UI Designer, 2V Educação) — 2026-09-11
> Uso: doc de direção pra Lorraine implementar direto. Decisões já tomadas — onde houver dúvida, a resposta padrão é "o que reforça a metáfora da lâmpada" (ver seção 1).
>
> **ATUALIZAÇÃO (Fase 2):** produto mudou — não há mais 3 salas com cenário SVG próprio; é **um mapa único** (escritório) renderizado em PixiJS (`src/features/scene`, dono: Pixi) com zonas dentro dele (biblioteca/café/estúdio/recepção). Paleta virou **P&B monocromático** (tokens shadcn `--background`/`--foreground`/etc, sem `--color-lamp`/`--color-glow`). Ver `docs/ARCHITECTURE.md` §13 pro modelo real implementado — as seções abaixo (paleta âmbar, cenário SVG por sala, Fraunces/Karla) descrevem a direção original, não o produto atual.

---

## 0. O que é, em uma frase

Uma sala de coworking silenciosa: você entra, senta numa mesa, opcionalmente escreve em que vai focar, e a sua lâmpada de mesa acende. Não tem chat, não tem voz, não tem reação. A prova de que "tem gente junto" é só isso: mesas com luz acesa. Sensação-alvo: **biblioteca às 23h, todo mundo estudando em silêncio, ninguém se conhece mas todo mundo está ali pelo mesmo motivo.**

---

## 1. Conceito e mood

### O detalhe memorável (âncora de tudo)
**A sala é escura por padrão. Cada pessoa que entra e escolhe um assento acende a própria lâmpada de mesa.** A sala fica progressivamente mais quente e viva conforme mais gente chega. Isso substitui qualquer indicador genérico de "online" (bolinha verde, avatar com borda) — aqui, presença = luz.

Consequência direta pra todo o resto do sistema:
- "Focando" não é um badge, é **a lâmpada acesa**.
- FOMO não é countdown, é **quantas luzes estão acesas agora** (na sala e globalmente).
- Empty state não é ilustração genérica, é **a sala apagada esperando a primeira luz**.
- Entrar não é "logar", é **"acender sua luz"**.

Esse mapeamento 1:1 entre metáfora e UI é o que evita a interface parecer "mais um app de produtividade com card 3x4 e gradiente".

### Mood
- Biblioteca à noite / café de estudo tarde da noite — não sala de aula, não escritório corporativo, não "app de produtividade SaaS".
- Referência visual: Gather (salinhas 2D, avatares nos assentos), mas **sem o verniz cartoon de MMORPG**. Menos "jogo", mais "cenário ilustrado calmo".
- Silêncio como recurso de design: sem confete, sem som de notificação, sem "3 pessoas estão digitando". Motion é sutil (respiração da luz, não celebração).

### Anti-slop — proibido nesta interface
- Gradiente purple-to-blue, glass morphism decorativo, cards uniformes em grid 3x4 idênticos.
- CTA "Get Started" / "Learn More" — usar verbo do domínio: **"Entrar e focar"**, **"Acender minha luz"**.
- Countdown falso ou número de "vagas restantes" que não vem de dado real.
- Avatar 3D estilo Bitmoji ou pixel-art custoso — ver seção 4 pro porquê.
- Ícone decorativo sem função (nenhum ícone "flourish" sem ligação com a metáfora luz/mesa/assento).

---

## 2. Paleta e tipografia

### Paleta — dark é o modo primário ("biblioteca à noite"), light é variante diurna ("café de estudo"), não um cidadão de segunda classe

Nomenclatura de token: `--color-*`. Valores em hex explícito (uso direto em `@theme`).

**Dark (default)**

| Token | Hex | Uso |
|---|---|---|
| `--color-bg` | `#15120F` | fundo da página — marrom-café quase preto, nunca preto puro |
| `--color-surface` | `#1D1912` | cards, painéis, room cards |
| `--color-surface-2` | `#262019` | elementos elevados — modal, sheet, hover de card |
| `--color-border` | `#35301F` | hairlines, divisores |
| `--color-text` | `#F3ECDF` | texto principal — branco quente |
| `--color-text-muted` | `#B8AD98` | texto secundário |
| `--color-text-subtle` | `#7C7563` | metadata, timestamps |
| `--color-lamp` | `#F0A93E` | **cor de assinatura** — luz acesa, presença, live indicators, CTA primário |
| `--color-lamp-dim` | `#6B5230` | luz apagada — assento vazio, estado inativo |
| `--color-moss` | `#52735A` | secundária — ícones de planta/estante, botões secundários |
| `--color-moss-surface` | `#2E3D31` | fundo de badges/chips secundários |
| `--color-rust` | `#C1613C` | acento raro — "sala quase cheia", ênfase pontual |

**Light ("café de estudo diurno")**

| Token | Hex | Uso |
|---|---|---|
| `--color-bg` | `#FAF5EA` | fundo — pergaminho quente, nunca branco puro |
| `--color-surface` | `#FFFFFF` | cards |
| `--color-surface-2` | `#F1E9D8` | elevado |
| `--color-border` | `#E3D8C0` | hairlines |
| `--color-text` | `#241F16` | texto principal |
| `--color-text-muted` | `#5B5340` | secundário |
| `--color-text-subtle` | `#8A8067` | metadata |
| `--color-lamp` | `#D98E1F` | mais escuro que no dark pra manter contraste AA em fundo claro |
| `--color-lamp-dim` | `#C9BCA0` | assento vazio |
| `--color-moss` | `#3F5D45` | secundária |
| `--color-moss-surface` | `#E2E8DE` | fundo badge secundário |
| `--color-rust` | `#A6482A` | acento raro |

Regra de uso: **`--color-lamp` é a única cor "quente e viva" no MVP.** Ela deve aparecer em: CTA principal, indicador de presença, contador de foco ao vivo, e nada mais. Se tudo usar amber, a metáfora da luz perde força — o resto da UI fica deliberadamente neutro (marrom/creme/texto) pra luz se destacar.

### Tipografia

| Papel | Fonte | Fallback | Peso/uso |
|---|---|---|---|
| Display (nome da sala, número do contador de foco, títulos de seção) | **Fraunces** (Google Fonts, variável, eixo `opsz`) | `ui-serif, Georgia, serif` | 500–600, `opsz` alto (soft/display), tracking levemente negativo |
| Body (tudo mais: labels, botões, tooltip, formulário) | **Karla** (Google Fonts) | `ui-sans-serif, system-ui, sans-serif` | 400/500, min 16px |
| Numérico ao vivo (contador global, timestamps) | Karla com `font-variant-numeric: tabular-nums` | — | evita "jitter" de layout quando número muda |

Por quê Fraunces: é uma serifada "soft/optical" com personalidade de página impressa — reforça biblioteca/livro sem ficar formal/institucional. Karla garante legibilidade 16px+ e contraste de peso claro contra o display, sem cair no par genérico Inter+Poppins.

```css
/* src/app/globals.css — ilustrativo, Tailwind v4 */
@import "tailwindcss";

:root {
  --color-bg: #FAF5EA;
  --color-surface: #FFFFFF;
  --color-surface-2: #F1E9D8;
  --color-border: #E3D8C0;
  --color-text: #241F16;
  --color-text-muted: #5B5340;
  --color-text-subtle: #8A8067;
  --color-lamp: #D98E1F;
  --color-lamp-dim: #C9BCA0;
  --color-moss: #3F5D45;
  --color-moss-surface: #E2E8DE;
  --color-rust: #A6482A;

  --radius-md: 12px;
  --radius-lg: 20px;

  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-sans: "Karla", ui-sans-serif, system-ui, sans-serif;
}

:root[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #15120F;
    --color-surface: #1D1912;
    --color-surface-2: #262019;
    --color-border: #35301F;
    --color-text: #F3ECDF;
    --color-text-muted: #B8AD98;
    --color-text-subtle: #7C7563;
    --color-lamp: #F0A93E;
    --color-lamp-dim: #6B5230;
    --color-moss: #52735A;
    --color-moss-surface: #2E3D31;
    --color-rust: #C1613C;
  }
}

@theme inline {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-2: var(--color-surface-2);
  --color-border: var(--color-border);
  --color-text: var(--color-text);
  --color-text-muted: var(--color-text-muted);
  --color-text-subtle: var(--color-text-subtle);
  --color-lamp: var(--color-lamp);
  --color-lamp-dim: var(--color-lamp-dim);
  --color-moss: var(--color-moss);
  --color-moss-surface: var(--color-moss-surface);
  --color-rust: var(--color-rust);
  --font-display: var(--font-display);
  --font-sans: var(--font-sans);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

Radius: **12px base** (botões, inputs, chips), **20px** em cards/modais/sheets. Cozy, não corporativo — mas nada de `rounded-full` em superfícies grandes (só em avatares e pílulas de status).

---

## 3. Dashboard (lista de salas, rota `/dashboard`)

> Nomenclatura: a tela abaixo era chamada de "lobby" na primeira versão deste doc — a rota final é `/dashboard` (pós-login) e é ali que ela vive. O conteúdo e as decisões não mudam, só a rota/nome de tela; onde este documento diz "dashboard" abaixo, é a mesma coisa que "lobby".

### RoomCard — miniatura do cenário, não card genérico
Cada sala no dashboard é representada por uma **miniatura real do cenário** (recorte do SVG de fundo da sala, ~ratio 16:10), com os assentos ocupados mostrados como pontinhos de luz âmbar nas posições reais (mesmas coordenadas do mapa completo, escaladas). Isso já comunica "tipo de sala" (biblioteca/café/estúdio) e "quão cheia está" numa imagem só — sem precisar de texto extra.

Estrutura do card (`RoomCard`):
```
┌─────────────────────────────┐
│ [miniatura do cenário]      │  ← SVG estático, pontos âmbar = ocupado
│  🔆 7 focando agora          │  ← LiveDot + contagem, live via polling/WS
├─────────────────────────────┤
│ Biblioteca Silenciosa        │  ← Fraunces, título da sala
│ Capacidade 7/12               │  ← texto secundário
└─────────────────────────────┘
```
- Clique no card = entra direto no fluxo de escolha de assento (não precisa de tela intermediária "detalhes da sala"). Isso já cobre a regra dos 3 cliques: **dashboard → assento → (nota opcional) → dentro** = no máximo 3 ações.
- Badge **"quase cheia"** (`--color-rust`, texto, sem ícone de alarme) aparece só quando ocupação ≥ 80% real — nunca antes disso. É a única peça de escassez na sala individual, e é verdadeira.

### Contador global — FOMO honesto
No topo do dashboard, fixo, fora de qualquer card: **"23 pessoas focando agora"** (`FocusCounter`), Fraunces grande pro número + Karla pequeno pro label, com `LiveDot` pulsando ao lado. Atualiza via polling curto (ou websocket se já existir infra de presença) — **nunca número estático hardcoded**. Esse é o único lugar de urgência/prova social do produto: sem countdown de "oferta expira em", sem "vagas limitadas" fabricadas. Honestidade aqui é o próprio produto (é uma sala de foco silenciosa — exagerar em gatilho de vendas quebraria o tom). A mesma query alimenta o contador equivalente da landing pública (seção 9) — uma única fonte de verdade.

### Empty state (sala com 0 pessoas)
Cenário renderiza normal, mas **todas as mesas com luz apagada** (usa os mesmos assets de "vazio" da seção 4). Texto central sobre a miniatura, tom convite não-culpabilizante:

> **Nenhuma luz acesa ainda.**
> Seja a primeira pessoa a focar aqui hoje.
> `[Acender minha luz]`

Sem ilustração de "deserto"/caixa vazia genérica — a própria sala apagada já é o empty state. Isso é mais forte visualmente e reforça a metáfora de novo.

### Empty state (dashboard sem nenhuma sala — ex: workspace novo)
Card único, tom prático: "Nenhuma sala criada ainda." + CTA pro coach criar a primeira (fora do escopo do usuário final, mas precisa existir pra onboarding).

---

## 4. Sala (mapa 2D)

### Decisão de abordagem: **(a) ilustração de fundo (SVG) + assentos por coordenada**, não pixel-art, não CSS isométrico

Justificativa de custo/produção (não temos ilustrador):
- **Pixel-art tileset (b)** exige dezenas de tiles consistentes (paredes, chão, móveis, variações) — produção alta mesmo gerando por IA, e qualquer inconsistência de estilo entre tiles gerados salta aos olhos. Descartado pro MVP.
- **CSS grid "isométrico leve" (c)** é barato de codar mas caro em resultado visual — isométrico feito com div/grid raramente convence, e o esforço de engenharia (projeção, z-index de sobreposição) não compensa pro ganho estético. Descartado.
- **SVG/PNG único de cenário (a)** é uma imagem só por "template de sala" (não por sala — ver abaixo), gerável via IA (Recraft, ou o pipeline OpenArt já disponível no ambiente) em estilo **flat illustration, vetorial, paleta travada nos hex da seção 2** — 1 asset resolve N salas. Assentos são posicionados por coordenada percentual sobre a imagem, não fazem parte do SVG (são elementos HTML/SVG separados, renderizados por cima) — permite animar luz/avatar sem re-gerar arte.

**Templates de cenário**, reusáveis entre salas (o coach escolhe um ao criar a sala):
1. `library-night` — biblioteca, estantes ao fundo, mesas individuais com lâmpada de leitura.
2. `study-cafe` — café de estudo, mesas de 2, janela ao fundo.
3. `studio-desks` — estúdio compartilhado, mesas em fileira, plantas.

Cada template é: 1 arquivo SVG (`/public/scenes/library-night.svg`) + 1 JSON de coordenadas de assento:

```json
// scenes/library-night.json
{
  "id": "library-night",
  "viewBox": "0 0 1200 750",
  "seats": [
    { "id": "seat-1", "x": 18.5, "y": 62.0, "facing": "right" },
    { "id": "seat-2", "x": 32.0, "y": 58.5, "facing": "left" },
    { "id": "seat-3", "x": 47.5, "y": 64.0, "facing": "right" }
    // x, y em % relativo ao viewBox — permite reescalar sem recálculo
  ]
}
```

### Assento livre vs ocupado
- **Livre**: cadeira/mesa no tom neutro do cenário, lâmpada com o token `--color-lamp-dim` (sem glow, sem sombra colorida). Cursor pointer, hover leve (a mesa "convida" — leve elevação de brightness, 4-6%).
- **Ocupado**: `PresenceAvatar` sentado + lâmpada em `--color-lamp` com glow (`box-shadow: 0 0 24px color-mix(in oklch, var(--color-lamp) 55%, transparent)`) e animação de respiração (ver seção 8). Não é clicável por outro usuário (assento ocupado não pode ser escolhido).
- **Seu assento**: anel sutil de 2px em `--color-lamp` ao redor do avatar, só pra você (não pros outros) — reforço de "esse aqui sou eu", sem badge extra.

### Avatar — `PresenceAvatar`
Atualizado após a decisão de auth ser **email + senha + username, sem Google/OAuth**: não existe foto de perfil disponível no MVP (nenhum provedor externo entrega foto). Decisão final, sem over-engineering:
1. **Único tier no MVP: iniciais em círculo com cor determinística** — hash simples do `username` mapeado pra uma paleta fixa de 8 tons dessaturados que já conversam com o cenário (variações de `--color-moss`, `--color-rust`, `--color-lamp-dim`, mais 5 tons neutros quentes intermediários). Sem DiceBear, sem geração de avatar cartoon: adicionaria dependência externa e um estilo visual (ilustração cartoon genérica) que não combina com o flat illustration do cenário.
2. Upload de foto própria (perfil do usuário) é uma extensão natural pro futuro — não implementar agora, mas a prop de `PresenceAvatar` já deve aceitar `photoUrl?: string` opcional pra não exigir refactor de assinatura depois; hoje esse campo sempre chega `undefined`.
3. Acessório (chapéu, planta na mesa) é **explicitamente fora do MVP** — mencionar no doc pra não ser esquecido, mas não implementar: adicionaria complexidade de composição de camadas sem ganho de foco no objetivo central (silêncio + presença).

Tamanho do avatar no mapa: 32-40px circular (desktop), nunca abaixo de 28px — importante pra legibilidade das iniciais.

### Indicador "focando" — sutil, não decorativo
A luz da lâmpada já É o indicador — não duplicar com badge "🟢 online" ao lado do avatar. Único movimento permitido: **respiração do glow** (`box-shadow` opacidade oscilando 85%→100%→85%), ciclo 4-6s, `ease-in-out`, infinito. Isso sozinho já comunica "presença viva" sem qualquer texto.

### Hover / tooltip
Hover (desktop) ou tap-and-hold (mobile) num assento ocupado mostra `SeatTooltip`:
```
Marina
"Escrevendo módulo 3 do curso"
```
Se a pessoa não escreveu nota de foco, mostra só o nome. Tooltip usa `--color-surface-2`, sem seta decorativa desnecessária — posiciona acima do assento, `role="tooltip"`, acessível via foco de teclado também (não só hover).

### Animação de entrada (sentar)
Sequência, 220-300ms total, `ease-out` tipo `cubic-bezier(0.16, 1, 0.3, 1)`:
1. Avatar aparece na posição do assento: `opacity 0→1` + `scale(0.9→1)` + `translateY(6px→0)`, 220ms.
2. Glow da lâmpada fade-in começa 80ms depois do avatar assentar (não simultâneo — dá sensação de "acender depois de sentar"), 300ms, opacity 0→1.
3. Respiração (loop contínuo) só começa depois do glow completar.

Com `prefers-reduced-motion: reduce`: remove `scale`/`translateY`, mantém só `opacity` fade em 150ms, e a respiração do glow vira estática (sem oscilação) — presença ainda é comunicada (luz acesa), só sem o movimento.

---

## 5. Micro-ritual de entrada

Fluxo (`EnterFocusSheet` — bottom sheet no mobile, dialog centrado no desktop):

1. Usuário clica num assento livre no mapa (ou, no fallback de lista, clica "Entrar" numa linha).
2. Abre sheet/dialog com:
   - Confirmação do assento escolhido (mini preview do cenário recortado, ou só texto "Mesa perto da janela" se quiser dar nome aos pontos — opcional, não bloqueia MVP).
   - Input de 1 linha, opcional, placeholder **"No que você vai focar? (opcional)"**, `maxLength=60`, contador discreto de caracteres restantes só quando passar de 45.
   - Dois botões: **"Acender minha luz"** (primário, `--color-lamp`) e **"Focar em silêncio"** (ghost/secundário, pula a nota) — os dois levam pro mesmo destino, a diferença é só se a nota é salva ou não. Isso mantém o fluxo em **3 cliques**: sala → assento → confirmar.
3. Ao confirmar: sheet fecha, mapa já mostra a animação de sentar da seção 4, luz acende.

Dado salvo por sessão (`FocusSession`): `seatId`, `focusNote?: string`, `startedAt: timestamp`. Campo `startedAt` já existe pensando no **pomodoro coletivo futuro** (não implementar agora, só não fechar a porta — sem criar tabela/campo extra especulativo além desse, que é natural do domínio "sessão de foco").

Sem timer obrigatório no MVP: nenhum contador de "tempo restante" na UI agora. Underscore: **não construir a UI de pomodoro ainda** — só garantir que o dado de início de sessão já existe pra não precisar de migração depois.

---

## 6. Mobile-first (375px)

Decisão: **sem pan/zoom livre por gesto customizado no MVP.** Gesture de pan/zoom livre é caro de acertar (conflita com scroll da página, ferramenta de estado complexa) e o ganho é baixo pra um cenário que já é desenhado pra ser lido inteiro numa tela.

Abordagem:
- **Scale-to-fit**: o SVG do cenário usa `viewBox` e escala pra caber na largura da viewport (`width: 100%; height: auto`), sem crop. Em telas muito baixas (paisagem curta), permite scroll vertical da página normalmente — não trava o cenário em `overflow: hidden`.
- **Pinch-zoom nativo do navegador liberado** (`touch-action: pinch-zoom` no container do mapa, não `none`) como enhancement pra quem quiser ver detalhe — não é o mecanismo principal de interação, é bônus do sistema.
- **Toggle Mapa/Lista** (`Tabs` do shadcn, 2 abas: "Mapa" e "Lista"): a lista (`RoomListFallback` dentro da sala = `SeatListFallback`) mostra os mesmos assentos como linhas — avatar, nome, nota de foco, botão "Entrar" — touch target 44px+ em cada linha. Essa lista **não é só fallback estético**: é o caminho de acessibilidade real pro mapa 2D, que é inerentemente difícil de navegar por teclado/leitor de tela. Recomendo lista como visualização **default abaixo de 400px** e mapa como default em tablet+, com preferência lembrada em `localStorage`.
- Hit area dos assentos no mapa: o círculo visual do avatar pode ser 28-32px, mas a área de toque real é um `<button>` invisível de no mínimo 44x44px centrado na mesma coordenada (padding além do visual, não redimensionar o avatar).

---

## 7. Componentes

### shadcn/ui a instalar
`button`, `card`, `avatar`, `dialog`, `sheet` (bottom sheet mobile), `input`, `tooltip`, `badge`, `skeleton`, `sonner` (toast), `separator`, `tabs` (toggle mapa/lista).

### Componentes custom (nomes em inglês, `src/features/room/...` seguindo DDD modular do projeto)
| Componente | Responsabilidade |
|---|---|
| `RoomCard` | Card de sala no dashboard (e versão pública read-only na landing) — miniatura do cenário + contagem live |
| `FocusCounter` | Número global "X focando agora", Fraunces + LiveDot |
| `LiveDot` | Bolinha pulsante de indicador ao vivo (reusado em RoomCard, FocusCounter, Seat) |
| `RoomMap` | Renderiza o SVG de cenário + posiciona `Seat[]` por coordenada |
| `Seat` | Um assento — estado livre/ocupado, hover/tooltip, click handler |
| `PresenceAvatar` | Avatar da pessoa — foto Google > iniciais coloridas |
| `SeatTooltip` | Tooltip de nome + nota de foco no hover/hold |
| `EnterFocusSheet` | Ritual de entrada — escolher nota de foco opcional, confirmar |
| `SeatListFallback` | Lista acessível de assentos, alternativa ao mapa |
| `RoomEmptyState` | Sala com cenário apagado + CTA "seja a primeira luz" |

---

## 8. Motion tokens e estados

### Tokens
```css
--motion-instant: 100ms;   /* press feedback */
--motion-fast: 180ms;      /* hover, toggle */
--motion-base: 240ms;      /* entrar/sair de elementos, sentar */
--motion-slow: 320ms;      /* dialog/sheet abrindo */
--motion-breathe: 5000ms;  /* respiração do glow da lâmpada, loop infinito */

--ease-enter: cubic-bezier(0.16, 1, 0.3, 1);   /* ease-out */
--ease-exit: cubic-bezier(0.4, 0, 1, 1);        /* ease-in, mais rápido que enter */
```
Regra: exit sempre mais curto que enter (ex: sheet abre em 320ms, fecha em 180ms). Press = `scale(0.96)` em `--motion-instant`. Nunca `transition: all` — sempre propriedades explícitas (`opacity, transform, box-shadow`).

### Loading
Skeleton, nunca spinner. `RoomCard` em loading = miniatura do cenário em tom sólido `--color-surface-2` com shimmer sutil, texto skeleton nas 2 linhas de título/capacidade. Sala carregando = cenário renderiza normal (é só uma imagem estática, carrega rápido) com assentos em skeleton pulse até os dados de presença chegarem.

### Empty
Ver seção 3 (lobby) e seção 4 (sala vazia) — sempre o próprio cenário apagado, nunca ilustração de "caixa vazia"/genérica.

### Error
Tom calmo, sem vermelho vivo nem alarme — usa `--color-rust` só no texto/ícone, fundo neutro. Copy direta, sem jargão técnico:
> "Não conseguimos abrir essa sala agora."
> `[Tentar de novo]`

Sem stack trace, sem "Error 500" visível ao usuário final.

---

## 9. Landing Page (`/`)

Objetivo único: converter visitante em conta criada, o mais rápido possível, sem escondê-la atrás de seções de marketing genéricas — o produto se explica em 6 blocos, todos ligados à metáfora da luz.

**Regra de roteamento**: se já existe sessão ativa, `/` redireciona direto pra `/dashboard`. A landing só é vista por quem ainda não tem conta.

### 1. Hero
- Eyebrow (Karla, `--color-text-subtle`, uppercase leve, tracking aberto): "Modo Foco Coletivo"
- Headline (Fraunces, display, maior elemento da página, `text-wrap: balance`): **"Foco não precisa de sala vazia."**
- Subheadline (Karla, `--color-text-muted`): "Entre numa sala silenciosa e sente ao lado de outras pessoas focando no mesmo horário que você. Sem chat. Sem câmera. Sem desculpa."
- CTA primário: **"Entrar na salinha"** (`--color-lamp`, grande) → `/cadastro`
- CTA secundário: **"Já tenho conta"** (outline/ghost) → `/login`
- Visual: miniatura viva do `RoomMap` (read-only, escala reduzida) da sala "vitrine" do momento (a de maior ocupação real agora), com as luzes que estiverem de fato acesas.

> **Decisão — dado real, nunca fake.** A cena do hero consome a mesma query de ocupação usada no dashboard. Enquanto carrega, mostra o cenário com todas as luzes apagadas (mesmo tratamento de loading da seção 8) — nunca preenche com número ou luz fictícia pra "parecer mais cheio". Um produto vendido em cima de "presença real" não pode abrir a própria vitrine com presença inventada; isso vale mais que qualquer hero mais "impressionante".

### 2. Prova social — contador global
- Se `liveCount > 0`, esse número é o protagonista: **"{liveCount} pessoas focando agora"** (ex.: "23 pessoas focando agora"), Fraunces grande + `LiveDot`.
- Se `liveCount === 0`, não escondemos o zero (inventar quebraria a regra de honestidade do doc todo) — mas trocamos o que é visualmente primário: o **número cumulativo real da semana** (quase nunca zero, e igualmente verdadeiro) assume o protagonismo, e o live count vira secundário e é reformulado como convite, não como vazio:
  - Principal: **"412 sessões de foco abertas essa semana"**
  - Secundário, pequeno: "0 pessoas focando neste minuto exato — seja a próxima."
- Fonte do número cumulativo: contagem real de `FocusSession` iniciadas nos últimos 7 dias.

### 3. Como funciona
3 colunas desktop / stack mobile. Número grande (Fraunces, `--color-lamp`) como único elemento visual — sem ícone decorativo.
1. **Crie sua conta** — "30 segundos, só usuário, email e senha."
2. **Escolha uma sala** — "Biblioteca, café ou estúdio — você escolhe o clima."
3. **Sente e foque** — "Acenda sua luz e trabalhe em silêncio, do seu jeito."

Bloco de venda do silêncio (texto corrido, sem card, logo abaixo dos passos):
> **Por que não tem chat, nem câmera, nem reação?**
> Porque a sensação de "não estou só" não vem de conversa — vem de saber que, do outro lado da tela, tem gente no mesmo silêncio, com o mesmo objetivo que o seu. Ninguém te interrompe. Ninguém te cobra. Só o barulho da sua própria produtividade.

### 4. Salas disponíveis
Reaproveita `RoomCard` (versão pública read-only, mesmo componente do dashboard) pros 3 templates — título de seção: **"Escolha onde focar hoje."** Grid 3 colunas desktop, stack mobile, contagem ao vivo real em cada card. Clique num card sem sessão ativa → `/cadastro` (produto exige conta pra sentar; não existe "entrar como visitante" no MVP).

### 5. FOMO honesto
Faixa horizontal, só com o que for real nesse instante:
- Badge condicional: **"Biblioteca Silenciosa está quase cheia"** — só renderiza se alguma sala estiver de fato ≥80% ocupada agora. Se nenhuma estiver, essa linha simplesmente não aparece (nunca inventa uma sala "quase cheia" pra preencher espaço).
- Métrica cumulativa real: **"Em média, 60 pessoas abrem uma sessão de foco por dia na Salinha."**

### 6. CTA final + footer
- Fechamento: "Sua próxima sessão de foco pode começar agora." + CTA único **"Entrar na salinha"** → `/cadastro`.
- Footer mínimo: nome do produto, link "Entrar" (`/login`), link "Criar conta" (`/cadastro`), © ano. Sem newsletter, sem redes sociais, sem seção "sobre nós" — o produto já disse o que precisava dizer.

### Mobile-first (375px)
Stack vertical 1→6. Hero em 375px: eyebrow → headline (2-3 linhas) → subheadline → CTAs full-width empilhados (primário no topo) → cena viva do mapa abaixo, nunca menor que ~140px de altura (usa o mesmo scale-to-fit da seção 6 deste doc) — a cena impressiona mesmo pequena porque é a mesma peça visual do produto real, não um asset de marketing separado.

---

## 10. Telas de Auth (`/login`, `/cadastro`)

### Layout
- **Desktop**: split 2 colunas. Esquerda (~45%) = painel ambiente fixo, recorte do cenário `library-night` com 3-4 lâmpadas acesas em respiração lenta — decorativo, continuidade de marca (não é alegação de prova social, então não entra na regra "nada fake" — é só cenário).
- **Mobile (<768px)**: painel ambiente encolhe pra uma faixa decorativa no topo (~96-120px, mesmo recorte, sem texto); o formulário ocupa o resto da tela e o botão principal fica visível sem scroll.

Card do formulário: `--radius-lg` (20px), fundo `--color-surface`, sem shadow pesada.

### `/cadastro` — campos
1. **Nome de usuário** (`username`) — label "Nome de usuário", placeholder "como_te_chamam"
2. **Email** (`email`) — label "Email"
3. **Senha** (`password`) — label "Senha", toggle mostrar/ocultar (ícone olho, `aria-label` "Mostrar senha"/"Ocultar senha"), sem campo de confirmação — reduz fricção, o toggle já resolve erro de digitação.
- Texto pequeno abaixo do botão (não checkbox, pra não adicionar clique): "Ao continuar, você concorda com os Termos e a Política de Privacidade."
- Botão primário: **"Acender minha luz"** (`--color-lamp`, full-width) — microcopy do conceito no lugar de "Criar conta".
- Link cruzado: "Já tem conta? **Entrar**" → `/login`

### `/login` — campos
1. **Email ou nome de usuário** (`identifier`) — label "Email ou usuário" (aceita os dois — menos fricção de "qual eu usei?")
2. **Senha** (`password`) — mesmo toggle mostrar/ocultar
- "Esqueci minha senha" (link pequeno, alinhado à direita do label da senha) → rota `/recuperar-senha` fica fora do escopo deste MVP, mas o link precisa existir na tela desde já — não deixar o usuário sem saída visível.
- Botão primário: **"Entrar na salinha"** (`--color-lamp`, full-width).
- Link cruzado: "Ainda não tem conta? **Criar conta**" → `/cadastro`

### Validação — onBlur, inline
Ícone de estado à direita do input após blur (check `--color-moss` / alerta `--color-rust`), mensagem abaixo do campo com `role="alert"` + `aria-describedby` + `aria-invalid` no input.

| Campo | Regra | Mensagem de erro |
|---|---|---|
| username | obrigatório, 3-20 caracteres, só letras/números/`_` | "Esse campo é obrigatório." / "Use só letras, números e _ (3 a 20 caracteres)." |
| username (unicidade) | checagem assíncrona debounced 400ms após blur, spinner pequeno enquanto verifica | "Esse nome de usuário já existe. Tenta outro?" |
| email | obrigatório, formato válido | "Esse campo é obrigatório." / "Digite um email válido." |
| password (cadastro) | obrigatório, mín. 8 caracteres, pelo menos 1 número | "Sua senha precisa de pelo menos 8 caracteres, com 1 número." |
| password (login) | obrigatório | "Esse campo é obrigatório." |
| identifier (login) | obrigatório | "Esse campo é obrigatório." |

### Erros de submissão (não de campo)
- Credenciais erradas no login: mensagem genérica, **nunca** indica qual campo está errado (evita enumeração de usuários existentes): "Email/usuário ou senha incorretos."
- Username já existe (corrida — passou pela checagem onBlur mas foi pego no submit): mesma mensagem "Esse nome de usuário já existe. Tenta outro?", foco automático no campo `username`.
- Erro de rede/servidor: toast (`sonner`) + mensagem no topo do form: "Não conseguimos conectar agora. Tenta de novo em alguns segundos."

### Loading
Botão primário mantém a largura, troca o label por spinner inline + texto de progresso (feedback de ação de botão é a exceção aceita à regra "skeleton > spinner" — que vale pra carregamento de conteúdo, não pra confirmação de uma ação já disparada pelo usuário):
- Cadastro: **"Acendendo sua luz..."**
- Login: **"Entrando..."**
Form inteiro fica `disabled` durante a request, pra evitar duplo submit.

### Sucesso
Cadastro concluído → redireciona direto pra `/dashboard`, sem tela intermediária de "conta criada" (economiza 1 clique e mantém a promessa dos 3 cliques desde a landing: hero CTA → form → dashboard). Toast leve opcional no dashboard: "Conta criada. Bem-vindo(a) à salinha." — não bloqueia navegação.

---

## Resumo de decisões pra não perder no caminho

| Decisão | Escolha | Descartado |
|---|---|---|
| Cenário da sala | SVG estático por template + assentos por coordenada | Pixel-art tileset, CSS isométrico |
| Avatar | Iniciais coloridas determinísticas (auth é email+senha, sem Google) | DiceBear, avatar 3D/cartoon, foto de OAuth |
| Indicador de presença | A própria luz da lâmpada (glow + respiração) | Badge "online" separado |
| Mapa mobile | Scale-to-fit + toggle lista (lista = via de acessibilidade) | Pan/zoom por gesto customizado |
| FOMO | Contador global real + badge "quase cheia" só com dado real (≥80%) | Countdown falso, "vagas limitadas" fabricadas |
| Timer/Pomodoro | Fora do MVP, mas `startedAt` já no modelo de dados | Construir UI de pomodoro agora |
| Modo padrão | Dark ("biblioteca à noite") com light completo ("café de estudo") | Light-first, ou dark como "modo extra" incompleto |
| Hero da landing | Cena viva com dado real de ocupação (mesma query do dashboard) | Animação decorativa "fake but honest" |
| Prova social com 0 gente | Métrica cumulativa real da semana assume o protagonismo | Escurecer/escrever "carregando..." pra esconder o zero |
| Auth | Email + senha + username, sem OAuth; identifier flexível no login | Cadastro com Google, campo de confirmação de senha |
| Rota pós-login | `/dashboard` (renome do "lobby") | Manter nome "lobby" na rota |
