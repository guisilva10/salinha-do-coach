"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MINUTE_OPTIONS = [5, 10, 15, 20, 25];
const DEFAULT_MINUTES = 25;

type FocusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (goal: string | undefined, minutes: number) => void;
};

/**
 * Mini-diálogo ao sentar numa cadeira de foco — objetivo opcional + duração
 * (max 25min). Os dois botões iniciam o pomodoro; "Focar em silêncio" só
 * pula a nota de objetivo (mesmo padrão do micro-ritual de entrada da Fase 1).
 */
export function FocusDialog({ open, onOpenChange, onConfirm }: FocusDialogProps) {
  const [goal, setGoal] = useState("");
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);

  const reset = () => {
    setGoal("");
    setMinutes(DEFAULT_MINUTES);
  };

  const handleConfirm = (withGoal: boolean) => {
    onConfirm(withGoal && goal.trim().length > 0 ? goal.trim() : undefined, minutes);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No que você vai focar?</DialogTitle>
          <DialogDescription>Opcional — só ajuda a lembrar depois.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="focus-goal">Objetivo (opcional)</Label>
            <Input
              id="focus-goal"
              value={goal}
              maxLength={80}
              placeholder="Ex.: escrever o módulo 3 do curso"
              onChange={(event) => setGoal(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="focus-minutes">Duração</Label>
            <select
              id="focus-minutes"
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {MINUTE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} minutos
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={() => handleConfirm(false)}>
            Focar em silêncio
          </Button>
          <Button type="button" onClick={() => handleConfirm(true)}>
            Acender minha luz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
