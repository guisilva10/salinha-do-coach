export type SeatState = {
  id: string;
  occupied: boolean;
};

type SeatPosition = {
  x: number;
  y: number;
};

// Coordenadas fixas de uma cena compacta (miniatura), 5 assentos.
// Mesmo princípio do mapa real (docs/DESIGN_DIRECTION.md seção 4): posições
// por coordenada sobre um cenário flat, não pixel-art.
//
// NOTA: o produto virou um mapa único com zonas (src/features/scene) em vez
// de templates de cenário por sala — por isso essa miniatura não varia mais
// por tipo de sala, é um cenário genérico único.
const SEAT_POSITIONS: SeatPosition[] = [
  { x: 60, y: 168 },
  { x: 132, y: 150 },
  { x: 204, y: 162 },
  { x: 276, y: 148 },
  { x: 344, y: 166 },
];

export const PREVIEW_SEAT_COUNT = SEAT_POSITIONS.length;

/**
 * Sintetiza quais das lâmpadas da miniatura aparecem acesas a partir de uma
 * contagem real (`liveCount`). O número é sempre real; qual lâmpada específica
 * "representa" cada pessoa é uma simplificação visual da miniatura (que já é
 * uma versão compacta do cenário, não o mapa completo) — nunca inventa gente.
 */
export function buildPreviewSeats(liveCount: number): SeatState[] {
  return Array.from({ length: PREVIEW_SEAT_COUNT }, (_, index) => ({
    id: `seat-${index}`,
    occupied: index < Math.min(liveCount, PREVIEW_SEAT_COUNT),
  }));
}

type RoomScenePreviewProps = {
  /** undefined = ocupação ainda não carregou (estado honesto de loading, nunca dado fake). */
  seats: SeatState[] | undefined;
  className?: string;
};

export function RoomScenePreview({ seats, className = "" }: RoomScenePreviewProps) {
  const isLoading = seats === undefined;

  return (
    <svg
      viewBox="0 0 404 220"
      role="img"
      aria-label="Cena do mapa com mesas e lâmpadas"
      className={className}
    >
      <rect x={0} y={196} width={404} height={24} className="fill-muted-foreground/10" />
      <rect x={16} y={12} width={60} height={54} rx={4} className="fill-muted-foreground/15" />
      <rect x={172} y={12} width={60} height={54} rx={4} className="fill-muted-foreground/15" />
      <rect x={328} y={12} width={60} height={54} rx={4} className="fill-muted-foreground/15" />
      {SEAT_POSITIONS.map((position, index) => (
        <rect
          key={`desk-${index}`}
          x={position.x - 26}
          y={position.y + 6}
          width={52}
          height={16}
          rx={4}
          className="fill-muted-foreground/15"
        />
      ))}
      {SEAT_POSITIONS.map((position, index) => (
        <SeatLamp
          key={seats?.[index]?.id ?? `seat-${index}`}
          x={position.x}
          y={position.y}
          lit={seats?.[index]?.occupied ?? false}
          isLoading={isLoading}
        />
      ))}
    </svg>
  );
}

type SeatLampProps = {
  x: number;
  y: number;
  lit: boolean;
  isLoading: boolean;
};

function SeatLamp({ x, y, lit, isLoading }: SeatLampProps) {
  if (isLoading) {
    return (
      <circle
        cx={x}
        cy={y}
        r={9}
        className="fill-muted-foreground/15 animate-pulse motion-reduce:animate-none"
      />
    );
  }

  if (!lit) {
    return <circle cx={x} cy={y} r={9} className="fill-muted-foreground/30" />;
  }

  return (
    <circle
      cx={x}
      cy={y}
      r={9}
      className="fill-foreground"
      style={{ filter: "drop-shadow(0 0 4px var(--foreground))" }}
    />
  );
}
