"use client";

import "./pixi-setup";
import { Application } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { computeWorldScale } from "../application/camera";
import type { Size } from "../application/camera";
import { describeWorld } from "../application/scene-helpers";
import type { Player, SceneTheme, Seat, WorldLayout, WorldPosition } from "../domain/world-layout";
import { TouchControls } from "./touch-controls";
import { useCoarsePointer } from "./use-coarse-pointer";
import { useMovementInput } from "./use-movement-input";
import { useReducedMotion } from "./use-reduced-motion";
import { WorldStage } from "./world-stage";

export type WorldSceneProps = {
  layout: WorldLayout;
  players: Player[];
  me: { userId: string };
  onMove: (position: WorldPosition) => void;
  onSit: (seatId: string) => void;
  onStand: () => void;
  theme: SceneTheme;
  /** Default `true`. `false` renders a spectator view (no input, camera centered). */
  interactive?: boolean;
  className?: string;
};

/** Height of the touch d-pad area, kept clear of the player by the camera. */
const TOUCH_CONTROLS_INSET = 150;

const KEYBOARD_HINT = "Ande com WASD ou setas. Perto de uma cadeira livre, aperte E para sentar.";

function useElementSize(): [RefObject<HTMLDivElement | null>, Size] {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((previous) =>
        previous.width === Math.round(width) && previous.height === Math.round(height)
          ? previous
          : { width: Math.round(width), height: Math.round(height) },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}

/**
 * Interactive office map: WASD/arrows (or the on-screen d-pad) move the local player,
 * the camera follows, and standing next to a free chair enables E / tap to sit.
 */
export function WorldScene({
  layout,
  players,
  me,
  onMove,
  onSit,
  onStand,
  theme,
  interactive = true,
  className,
}: WorldSceneProps) {
  const [wrapperRef, viewport] = useElementSize();
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reachableSeat, setReachableSeat] = useState<Seat | null>(null);
  const reducedMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();

  const localPlayer = players.find((player) => player.userId === me.userId);
  const isSeated = localPlayer?.seatId != null;

  const handleSitKey = () => {
    if (reachableSeat) onSit(reachableSeat.id);
  };
  const { inputRef, handleKeyDown, handleKeyUp, clearInput, setTouchDirection } = useMovementInput({
    isEnabled: interactive,
    onSitKey: handleSitKey,
  });

  const scale = computeWorldScale(viewport.width || 1);
  const showTouchControls = interactive && isCoarsePointer;
  const hasViewport = viewport.width > 0 && viewport.height > 0;
  const description = describeWorld(layout, players);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        ref={wrapperRef}
        role={interactive ? "application" : "img"}
        aria-label={description}
        aria-describedby={interactive ? "world-scene-hint" : undefined}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={clearInput}
        className={cn(
          "relative h-full w-full touch-none overflow-hidden bg-background outline-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground",
        )}
      >
        {hasViewport && (
          <Application
            resizeTo={wrapperRef}
            backgroundAlpha={0}
            antialias={false}
            roundPixels
            autoDensity
            resolution={typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 2)}
            autoStart
          >
            <WorldStage
              layout={layout}
              players={players}
              meId={me.userId}
              theme={theme}
              viewport={viewport}
              scale={scale}
              cameraBottomInset={showTouchControls ? TOUCH_CONTROLS_INSET : 0}
              interactive={interactive}
              animate={!reducedMotion}
              inputRef={inputRef}
              onMove={onMove}
              onSit={onSit}
              onStand={onStand}
              onReachableSeatChange={setReachableSeat}
              onReady={() => setIsReady(true)}
              onError={() => setHasError(true)}
            />
          </Application>
        )}
        {!isReady && !hasError && <Skeleton className="absolute inset-0 rounded-none" aria-hidden="true" />}
        {hasError && (
          <p role="alert" className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
            Não foi possível carregar o cenário. Recarregue a página para tentar de novo.
          </p>
        )}
        {showTouchControls && isReady && (
          <TouchControls
            onDirectionChange={setTouchDirection}
            canSit={reachableSeat !== null}
            isSeated={isSeated}
            onSit={handleSitKey}
          />
        )}
      </div>
      {interactive && (
        <p
          id="world-scene-hint"
          aria-live="polite"
          className="pointer-events-none absolute top-4 left-1/2 z-10 max-w-[60vw] -translate-x-1/2 rounded-md border border-border bg-background/80 px-3 py-1.5 text-center text-xs text-muted-foreground backdrop-blur"
        >
          {isSeated
            ? "Você está sentado. Aperte qualquer direção para levantar."
            : reachableSeat
              ? "Cadeira livre ao lado — aperte E ou toque nela para sentar e acender sua luz."
              : KEYBOARD_HINT}
        </p>
      )}
    </div>
  );
}
