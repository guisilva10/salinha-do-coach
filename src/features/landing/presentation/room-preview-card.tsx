import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveDot } from "@/shared/ui/live-dot";
import { RoomScenePreview, type SeatState } from "./room-scene-preview";

export type RoomPreviewCardProps = {
  name: string;
  /** undefined enquanto a sala ainda não carregou. */
  capacity: number | undefined;
  /** undefined = ocupação ainda não carregou. */
  seats: SeatState[] | undefined;
  /** undefined = contagem ainda não carregou — nunca mostramos número fabricado. */
  liveCount: number | undefined;
  /** true só quando a ocupação real for >= 80% (docs/DESIGN_DIRECTION.md seção 3). */
  isNearlyFull: boolean;
};

export function RoomPreviewCard({
  name,
  capacity,
  seats,
  liveCount,
  isNearlyFull,
}: RoomPreviewCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="px-3 pt-3">
        <RoomScenePreview seats={seats} className="h-auto w-full rounded-md" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{name}</CardTitle>
          {isNearlyFull && (
            <Badge variant="secondary">
              Quase cheia
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardFooter className="justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <LiveDot />
          {liveCount === undefined ? "carregando..." : `${liveCount} focando agora`}
        </span>
        {capacity !== undefined && <span>Capacidade {capacity}</span>}
      </CardFooter>
    </Card>
  );
}
