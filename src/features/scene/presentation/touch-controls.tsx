"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Armchair } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { IDLE_DIRECTION } from "../application/movement";
import type { Direction } from "../application/movement";

type TouchControlsProps = {
  onDirectionChange: (direction: Direction) => void;
  canSit: boolean;
  isSeated: boolean;
  onSit: () => void;
};

const PAD_BUTTONS: { label: string; direction: Direction; icon: ComponentType<{ className?: string }>; area: string }[] = [
  { label: "Andar para cima", direction: { dx: 0, dy: -1 }, icon: ArrowUp, area: "col-start-2 row-start-1" },
  { label: "Andar para a esquerda", direction: { dx: -1, dy: 0 }, icon: ArrowLeft, area: "col-start-1 row-start-2" },
  { label: "Andar para a direita", direction: { dx: 1, dy: 0 }, icon: ArrowRight, area: "col-start-3 row-start-2" },
  { label: "Andar para baixo", direction: { dx: 0, dy: 1 }, icon: ArrowDown, area: "col-start-2 row-start-3" },
];

const BUTTON_CLASS =
  "flex size-12 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur-sm active:scale-95 active:bg-foreground active:text-background";

/** On-screen d-pad + sit button for touch devices (44px+ targets). */
export function TouchControls({ onDirectionChange, canSit, isSeated, onSit }: TouchControlsProps) {
  const release = () => onDirectionChange(IDLE_DIRECTION);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-end justify-between px-3">
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1" aria-label="Controles de movimento">
        {PAD_BUTTONS.map(({ label, direction, icon: Icon, area }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={cn(BUTTON_CLASS, area)}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              onDirectionChange(direction);
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onContextMenu={(event) => event.preventDefault()}
          >
            <Icon className="size-5" aria-hidden="true" />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSit}
        disabled={!canSit || isSeated}
        className={cn(
          "pointer-events-auto flex h-12 items-center gap-2 rounded-full border border-border bg-background/80 px-4 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm",
          "disabled:opacity-40 active:scale-95",
        )}
      >
        <Armchair className="size-5" aria-hidden="true" />
        {isSeated ? "Sentado" : "Sentar"}
      </button>
    </div>
  );
}
