"use client";

import "./pixi-setup";
import { Application } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { computeFitScale } from "../application/camera";
import { describeWorld } from "../application/scene-helpers";
import type { Player, SceneTheme, WorldLayout } from "../domain/world-layout";
import { WorldStage } from "./world-stage";

export type WorldScenePreviewProps = {
  layout: WorldLayout;
  players: Player[];
  theme: SceneTheme;
  className?: string;
};

/**
 * Whole map as a still image (cards, hero): no ticker, one draw per data change.
 * The canvas renders at an integer zoom and is scaled down by CSS on narrow screens.
 */
export function WorldScenePreview({ layout, players, theme, className }: WorldScenePreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const world = { width: layout.cols * layout.tileSize, height: layout.rows * layout.tileSize };
  const scale = computeFitScale(world, { width, height: Number.POSITIVE_INFINITY });
  const canvas = { width: world.width * scale, height: world.height * scale };

  return (
    <div
      ref={wrapperRef}
      role="img"
      aria-label={describeWorld(layout, players)}
      style={{ aspectRatio: `${layout.cols} / ${layout.rows}` }}
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-background [&>canvas]:mx-auto [&>canvas]:max-w-full [&>canvas]:h-auto!",
        className,
      )}
    >
      {width > 0 && (
        <Application
          width={canvas.width}
          height={canvas.height}
          backgroundAlpha={0}
          antialias={false}
          roundPixels
          autoDensity
          resolution={typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 2)}
          autoStart={false}
        >
          <WorldStage
            layout={layout}
            players={players}
            theme={theme}
            viewport={canvas}
            scale={scale}
            interactive={false}
            animate={false}
            renderOnDemand
            onReady={() => setIsReady(true)}
          />
        </Application>
      )}
      {!isReady && <Skeleton className="absolute inset-0 rounded-lg" aria-hidden="true" />}
    </div>
  );
}
