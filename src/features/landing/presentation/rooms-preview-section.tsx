"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { RoomPreviewCard } from "./room-preview-card";
import { buildPreviewSeats } from "./room-scene-preview";
import { SectionEyebrow } from "./section-eyebrow";

const LOADING_PLACEHOLDER_COUNT = 3;

// Dado real: api.rooms.listRoomsWithOccupancy -> { id, slug, name,
// description, capacity, liveCount }[]. Sem catálogo estático — as salas
// (zonas do mapa único, ver src/features/scene) que aparecem aqui são as
// que de fato existem no Convex.
export function RoomsPreviewSection() {
  const rooms = useQuery(api.rooms.listRoomsWithOccupancy);

  return (
    <section
      id="salas"
      aria-labelledby="rooms-preview-heading"
      className="mx-auto w-full max-w-5xl scroll-mt-16 px-4 py-16 text-center sm:px-6"
    >
      <SectionEyebrow>Salas</SectionEyebrow>
      <h2 id="rooms-preview-heading" className="mt-4 text-3xl font-extrabold sm:text-4xl">
        Escolha onde focar hoje
      </h2>
      <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        {rooms === undefined
          ? Array.from({ length: LOADING_PLACEHOLDER_COUNT }, (_, index) => (
              <RoomPreviewCard
                key={`loading-${index}`}
                name="Carregando..."
                capacity={undefined}
                seats={undefined}
                liveCount={undefined}
                isNearlyFull={false}
              />
            ))
          : rooms.map((room) => (
              <RoomPreviewCard
                key={room.slug}
                name={room.name}
                capacity={room.capacity}
                seats={buildPreviewSeats(room.liveCount)}
                liveCount={room.liveCount}
                isNearlyFull={room.capacity > 0 && room.liveCount / room.capacity >= 0.8}
              />
            ))}
      </div>
    </section>
  );
}
