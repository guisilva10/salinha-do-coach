"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Music, Timer, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSeatById } from "@/features/scene/application/scene-helpers";
import { OFFICE_LAYOUT } from "@/features/scene/domain/layouts/office";
import type { WorldPlayer } from "../../domain/entities/world-player";

type OnlinePeoplePanelProps = {
  players: WorldPlayer[];
};

function seatModeIcon(player: WorldPlayer) {
  const seat = getSeatById(OFFICE_LAYOUT, player.seatId);
  if (!seat) {
    return null;
  }
  if (seat.kind === "focus") {
    return <Timer className="size-3.5 text-muted-foreground" aria-label="Focando" />;
  }
  if (seat.kind === "lofi") {
    return <Music className="size-3.5 text-muted-foreground" aria-label="Ouvindo lofi" />;
  }
  return null;
}

function zoneName(zoneId: string): string {
  return OFFICE_LAYOUT.zones.find((zone) => zone.id === zoneId)?.name ?? zoneId;
}

function initials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function OnlinePeoplePanel({ players }: OnlinePeoplePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-auto fixed left-4 top-4 z-20 max-w-[min(85vw,20rem)]">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 gap-1.5 bg-background/80 backdrop-blur"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls="online-people-list"
      >
        <Users className="size-4" aria-hidden="true" />
        {players.length} online
        {isOpen ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </Button>

      {isOpen ? (
        <ul
          id="online-people-list"
          className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-background/90 p-2 backdrop-blur"
        >
          {players.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              Nenhuma luz acesa ainda.
            </li>
          ) : (
            players.map((player) => (
              <li
                key={player.userId}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
              >
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">
                    {initials(player.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{player.username}</span>
                <span className="text-xs text-muted-foreground">
                  {zoneName(player.zoneId)}
                </span>
                {seatModeIcon(player)}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
