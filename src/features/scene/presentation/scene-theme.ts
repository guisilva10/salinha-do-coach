import type { SceneTheme } from "../domain/world-layout";

export type ScenePalette = {
  /** Solid fill under the tiles (shows through transparent tile corners and outside the map). */
  groundColor: number;
  /** Multiplied into floor, walls, furniture and free chairs: the room is dark by default. */
  dimTint: number;
  /** Slightly brighter tint for a hovered chair. */
  hoverTint: number;
  glowAlpha: number;
  offlineGlowAlpha: number;
  nameTagFill: number;
  nameTagStroke: number;
};

/** Amber from the design tokens (`--color-lamp`). */
export const LAMP_COLOR = 0xf0a93e;

export const SCENE_PALETTE: Record<SceneTheme, ScenePalette> = {
  dark: {
    groundColor: 0x1a1612,
    dimTint: 0x6e6862,
    hoverTint: 0x8f8880,
    glowAlpha: 0.6,
    offlineGlowAlpha: 0.18,
    nameTagFill: 0xf3ecdf,
    nameTagStroke: 0x15120f,
  },
  light: {
    groundColor: 0xcfc6b6,
    dimTint: 0xd6d0c6,
    hoverTint: 0xe9e4db,
    glowAlpha: 0.4,
    offlineGlowAlpha: 0.12,
    nameTagFill: 0x241f16,
    nameTagStroke: 0xfaf5ea,
  },
};

export const LIT_TINT = 0xffffff;
export const OFFLINE_ALPHA = 0.45;
