"use client";

import { useState } from "react";
import { LazyWorldScene } from "@/features/scene";
import { getSeatById } from "@/features/scene/application/scene-helpers";
import { OFFICE_LAYOUT } from "@/features/scene/domain/layouts/office";
import { useMe } from "../hooks/use-me";
import { usePlayers } from "../hooks/use-players";
import { useWorldActions } from "../hooks/use-world-actions";
import { useEventFeed } from "../hooks/use-event-feed";
import type { WorldPlayer } from "../../domain/entities/world-player";
import { FocusDialog } from "./focus-dialog";
import { FocusHud } from "./focus-hud";
import { LofiPlayer } from "./lofi-player";
import { OnlinePeoplePanel } from "./online-people-panel";
import { SeatListFallback } from "./seat-list-fallback";
import { WorldCornerHud } from "./world-corner-hud";

function FullScreenLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Acendendo as luzes do escritório...</p>
    </div>
  );
}

export function DashboardWorld() {
  const { me, userId } = useMe();
  const { players } = usePlayers();

  if (!me || !userId || players === undefined) {
    return <FullScreenLoading />;
  }

  return <DashboardWorldReady me={me} userId={userId} players={players} />;
}

type DashboardWorldReadyProps = {
  me: WorldPlayer;
  userId: string;
  players: WorldPlayer[];
};

function DashboardWorldReady({ me, userId, players }: DashboardWorldReadyProps) {
  const { move, sit, stand, startFocus, stopFocus } = useWorldActions(userId);
  useEventFeed(players);

  const [isFocusDialogOpen, setIsFocusDialogOpen] = useState(false);
  const [lastSeatId, setLastSeatId] = useState(me.seatId);

  const mySeat = getSeatById(OFFICE_LAYOUT, me.seatId);

  // Ajusta estado durante o render (não em efeito) ao detectar a transição
  // de assento — padrão recomendado pra "reagir a mudança de prop" sem
  // disparar um render em cascata (react-hooks/set-state-in-effect).
  if (me.seatId !== lastSeatId) {
    setLastSeatId(me.seatId);
    if (me.seatId && mySeat?.kind === "focus" && me.focusUntil === undefined) {
      setIsFocusDialogOpen(true);
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <LazyWorldScene
        layout={OFFICE_LAYOUT}
        players={players}
        me={{ userId }}
        onMove={move}
        onSit={(seatId) => void sit(seatId)}
        onStand={() => void stand()}
        theme="dark"
        className="h-full w-full"
      />

      <OnlinePeoplePanel players={players} />

      <div className="pointer-events-auto fixed left-4 top-20 z-20">
        <SeatListFallback
          players={players}
          mySeatId={me.seatId}
          onSit={(seatId) => void sit(seatId)}
          onStand={() => void stand()}
        />
      </div>

      <WorldCornerHud />

      {me.focusUntil !== undefined ? (
        <FocusHud
          focusUntil={me.focusUntil}
          focusGoal={me.focusGoal}
          onStop={() => void stopFocus()}
        />
      ) : null}

      {mySeat?.kind === "lofi" ? <LofiPlayer /> : null}

      <FocusDialog
        open={isFocusDialogOpen}
        onOpenChange={setIsFocusDialogOpen}
        onConfirm={(goal, minutes) => {
          setIsFocusDialogOpen(false);
          void startFocus(goal, minutes);
        }}
      />
    </div>
  );
}
