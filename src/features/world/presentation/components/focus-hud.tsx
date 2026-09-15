"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRemainingMinutes } from "@/features/scene/application/scene-helpers";

type FocusHudProps = {
  focusUntil: number;
  focusGoal?: string;
  onStop: () => void;
};

/** HUD do próprio pomodoro — timer regressivo + parar. Só aparece pra quem está focando. */
export function FocusHud({ focusUntil, focusGoal, onStop }: FocusHudProps) {
  const [now, setNow] = useState(() => Date.now());
  const hasAutoStoppedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (now >= focusUntil && !hasAutoStoppedRef.current) {
      hasAutoStoppedRef.current = true;
      onStop();
    }
  }, [now, focusUntil, onStop]);

  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-background/90 px-4 py-2 backdrop-blur">
      <div>
        <p className="text-sm font-semibold tabular-nums">
          {formatRemainingMinutes(focusUntil, now)} restantes
        </p>
        {focusGoal ? <p className="text-xs text-muted-foreground">{focusGoal}</p> : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="min-h-11 min-w-11"
        aria-label="Parar foco"
        onClick={onStop}
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
