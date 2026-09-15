import type { Player } from "@/features/scene/domain/world-layout";

/**
 * `Player` (WorldScene, dono: Pixi) + `zoneId` — extensão só nossa, usada
 * pelos componentes de HUD (lista online, feed de eventos) que precisam
 * saber a zona atual sem recalcular a partir de x/y. `WorldPlayer` é
 * estruturalmente compatível com `Player` — pode ser passado direto pra
 * `WorldScene` sem cast.
 */
export type WorldPlayer = Player & { zoneId: string };
