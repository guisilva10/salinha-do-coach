"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SectionEyebrow } from "./section-eyebrow";
import { RoomScenePreview, buildPreviewSeats } from "./room-scene-preview";

// Estrutura de referência: seção "map-feature" do Gather (docs/design-ref/gather.town)
// — eyebrow + H2 + subhead + visual grande do produto + cards de destaque.
//
// NOTA: o produto virou um mapa único com zonas (src/features/scene), não
// mais salas com template próprio — por isso a miniatura usa o total real de
// gente focando agora (api.stats.globalFocusCount), não mais "a sala mais
// cheia". Nunca dado fake.
export function ShowcaseSection() {
  const stats = useQuery(api.stats.globalFocusCount);

  return (
    <section
      aria-labelledby="showcase-heading"
      className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6"
    >
      <SectionEyebrow>Modo Foco Coletivo</SectionEyebrow>
      <h2 id="showcase-heading" className="mt-4 text-balance text-3xl font-extrabold sm:text-4xl">
        A sala existe, mesmo em silêncio.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
        Cada lâmpada acesa é uma pessoa de verdade, focando agora. Ninguém fala, ninguém aparece em
        câmera — só presença.
      </p>
      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
        <RoomScenePreview
          seats={stats ? buildPreviewSeats(stats.liveCount) : undefined}
          className="h-auto w-full"
        />
        <p className="mt-3 text-xs text-muted-foreground">
          {stats ? `${stats.liveCount} focando agora` : "Carregando..."}
        </p>
      </div>
      <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
        <ShowcaseCallout
          title="Presença real"
          description="Sem check-in falso: a luz só acende com gente de verdade sentada."
        />
        <ShowcaseCallout
          title="Sem chat, sem câmera"
          description="Ninguém te interrompe. Só o silêncio de quem também está focando."
        />
      </div>
    </section>
  );
}

type ShowcaseCalloutProps = {
  title: string;
  description: string;
};

function ShowcaseCallout({ title, description }: ShowcaseCalloutProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
