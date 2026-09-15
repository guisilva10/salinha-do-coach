"use client";

import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getSeatOccupancy } from "@/features/scene/application/scene-helpers";
import { OFFICE_LAYOUT } from "@/features/scene/domain/layouts/office";
import type { WorldPlayer } from "../../domain/entities/world-player";

const SEAT_KIND_LABEL: Record<string, string> = {
  plain: "comum",
  focus: "foco",
  lofi: "lofi",
};

type SeatListFallbackProps = {
  players: WorldPlayer[];
  mySeatId: string | null;
  onSit: (seatId: string) => void;
  onStand: () => void;
};

/**
 * Fallback de acessibilidade pra sentar via teclado/leitor de tela — o
 * mapa 2D em canvas não é navegável por teclado por padrão. Lista todos os
 * assentos agrupados por zona, com quem está sentado e um botão sentar/levantar.
 */
export function SeatListFallback({ players, mySeatId, onSit, onStand }: SeatListFallbackProps) {
  const occupancy = getSeatOccupancy(players);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="pointer-events-auto min-h-11 gap-1.5 bg-background/80 backdrop-blur"
          >
            <List className="size-4" aria-hidden="true" />
            Assentos
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Assentos do escritório</SheetTitle>
          <SheetDescription>
            Alternativa por teclado ao mapa — sente ou levante sem precisar arrastar o avatar.
          </SheetDescription>
        </SheetHeader>

        <ul className="flex flex-col gap-1 overflow-y-auto px-4 pb-4">
          {OFFICE_LAYOUT.zones.map((zone) => (
            <li key={zone.id} className="flex flex-col gap-1">
              <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                {zone.name}
              </p>
              {OFFICE_LAYOUT.seats
                .filter((seat) => seat.zoneId === zone.id)
                .map((seat) => {
                  const occupant = occupancy.get(seat.id);
                  const isMine = seat.id === mySeatId;
                  const isFree = !occupant || !occupant.isOnline;

                  return (
                    <div
                      key={seat.id}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm"
                    >
                      <span className="flex-1 truncate">
                        {isMine
                          ? "Você"
                          : occupant && occupant.isOnline
                            ? occupant.username
                            : "Livre"}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({SEAT_KIND_LABEL[seat.kind] ?? seat.kind})
                        </span>
                      </span>
                      {isMine ? (
                        <Button type="button" size="sm" variant="outline" onClick={onStand}>
                          Levantar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!isFree}
                          onClick={() => onSit(seat.id)}
                        >
                          Sentar
                        </Button>
                      )}
                    </div>
                  );
                })}
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
