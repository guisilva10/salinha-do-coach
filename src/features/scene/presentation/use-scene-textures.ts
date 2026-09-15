"use client";

import { Assets, Rectangle, Texture } from "pixi.js";
import { useEffect, useState } from "react";
import {
  GLOW_URL,
  PIXEL_FONT_FAMILY,
  PIXEL_FONT_URL,
  SHEETS,
  getCharacterSource,
  getTileSource,
} from "../domain/tile-atlas";
import type { SheetId, TileSource } from "../domain/tile-atlas";

export type SceneTextures = {
  tile: (id: number) => Texture;
  source: (source: TileSource) => Texture;
  character: (variant: number) => Texture;
  glow: Texture;
  fontFamily: string;
};

const FALLBACK_FONT_FAMILY = "monospace";

let loadPromise: Promise<SceneTextures> | null = null;

function createTextureLookup(sheets: Record<SheetId, Texture>): (source: TileSource) => Texture {
  const cache = new Map<string, Texture>();
  return ({ sheet, col, row }) => {
    const key = `${sheet}:${col}:${row}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const { tileSize, margin } = SHEETS[sheet];
    const step = tileSize + margin;
    const texture = new Texture({
      source: sheets[sheet].source,
      frame: new Rectangle(col * step, row * step, tileSize, tileSize),
    });
    cache.set(key, texture);
    return texture;
  };
}

async function loadFontFamily(): Promise<string> {
  try {
    await Assets.load({ src: PIXEL_FONT_URL, data: { family: PIXEL_FONT_FAMILY } });
    return PIXEL_FONT_FAMILY;
  } catch (error) {
    console.error("Scene pixel font failed to load, falling back to monospace", { url: PIXEL_FONT_URL, error });
    return FALLBACK_FONT_FAMILY;
  }
}

async function loadSceneTextures(): Promise<SceneTextures> {
  const sheetIds = Object.keys(SHEETS) as SheetId[];
  const [sheetTextures, glow, fontFamily] = await Promise.all([
    Promise.all(sheetIds.map((id) => Assets.load<Texture>(SHEETS[id].url))),
    Assets.load<Texture>(GLOW_URL),
    loadFontFamily(),
  ]);
  const sheets = Object.fromEntries(sheetIds.map((id, i) => [id, sheetTextures[i]])) as Record<SheetId, Texture>;
  const source = createTextureLookup(sheets);
  return {
    source,
    tile: (id) => {
      const tileSource = getTileSource(id);
      return tileSource ? source(tileSource) : Texture.EMPTY;
    },
    character: (variant) => source(getCharacterSource(variant)),
    glow,
    fontFamily,
  };
}

export type SceneTexturesState =
  | { status: "loading"; textures: null }
  | { status: "ready"; textures: SceneTextures }
  | { status: "error"; textures: null };

/** Loads (once per page) and shares every sheet, the glow and the pixel font. */
export function useSceneTextures(): SceneTexturesState {
  const [state, setState] = useState<SceneTexturesState>({ status: "loading", textures: null });

  useEffect(() => {
    let isActive = true;
    loadPromise ??= loadSceneTextures();
    loadPromise
      .then((textures) => {
        if (isActive) setState({ status: "ready", textures });
      })
      .catch((error: unknown) => {
        loadPromise = null;
        console.error("Scene sprites failed to load", { error });
        if (isActive) setState({ status: "error", textures: null });
      });
    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
