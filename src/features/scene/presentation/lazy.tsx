"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function SceneFallback() {
  return <Skeleton className="h-[min(70vh,640px)] w-full rounded-lg" aria-hidden="true" />;
}

function PreviewFallback() {
  return <Skeleton className="aspect-[4/3] w-full rounded-lg" aria-hidden="true" />;
}

/** Client-only scene (PixiJS touches `window`/WebGL): never rendered on the server. */
export const LazyWorldScene = dynamic(() => import("./world-scene").then((module) => module.WorldScene), {
  ssr: false,
  loading: SceneFallback,
});

export const LazyWorldScenePreview = dynamic(
  () => import("./world-scene-preview").then((module) => module.WorldScenePreview),
  { ssr: false, loading: PreviewFallback },
);
