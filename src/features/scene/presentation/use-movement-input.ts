"use client";

import { useRef } from "react";
import type { KeyboardEvent, RefObject } from "react";
import type { Direction } from "../application/movement";

const MOVE_KEYS: Record<string, keyof MovementInput["held"]> = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

const SIT_KEYS = new Set(["KeyE", "Enter"]);

export type MovementInput = {
  held: { up: boolean; down: boolean; left: boolean; right: boolean };
  touch: Direction;
};

export type MovementInputRef = RefObject<MovementInput>;

function axis(negative: boolean, positive: boolean): -1 | 0 | 1 {
  if (negative === positive) return 0;
  return negative ? -1 : 1;
}

/** Keyboard (WASD/arrows) + on-screen d-pad, combined into one direction. Read it inside the ticker. */
export function readDirection(input: MovementInput): Direction {
  if (input.touch.dx !== 0 || input.touch.dy !== 0) return input.touch;
  return {
    dx: axis(input.held.left, input.held.right),
    dy: axis(input.held.up, input.held.down),
  };
}

export function isSitKey(code: string): boolean {
  return SIT_KEYS.has(code);
}

type Options = {
  isEnabled: boolean;
  onSitKey: () => void;
};

export function useMovementInput({ isEnabled, onSitKey }: Options) {
  const inputRef = useRef<MovementInput>({
    held: { up: false, down: false, left: false, right: false },
    touch: { dx: 0, dy: 0 },
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isEnabled) return;
    if (isSitKey(event.code)) {
      event.preventDefault();
      onSitKey();
      return;
    }
    const key = MOVE_KEYS[event.code];
    if (!key) return;
    event.preventDefault();
    inputRef.current.held[key] = true;
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLElement>) => {
    const key = MOVE_KEYS[event.code];
    if (!key) return;
    inputRef.current.held[key] = false;
  };

  const clearInput = () => {
    inputRef.current.held = { up: false, down: false, left: false, right: false };
    inputRef.current.touch = { dx: 0, dy: 0 };
  };

  const setTouchDirection = (direction: Direction) => {
    inputRef.current.touch = direction;
  };

  return { inputRef, handleKeyDown, handleKeyUp, clearInput, setTouchDirection };
}
