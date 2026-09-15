import type { Metadata } from "next";
import { LandingHeader } from "@/features/landing/presentation/landing-header";
import { HeroSection } from "@/features/landing/presentation/hero-section";
import { ShowcaseSection } from "@/features/landing/presentation/showcase-section";
import { LiveFocusCounter } from "@/features/landing/presentation/live-focus-counter";
import { HowItWorksSection } from "@/features/landing/presentation/how-it-works-section";
import { RoomsPreviewSection } from "@/features/landing/presentation/rooms-preview-section";
import { FinalCtaSection } from "@/features/landing/presentation/final-cta-section";
import { FaqSection } from "@/features/landing/presentation/faq-section";
import { LandingFooter } from "@/features/landing/presentation/landing-footer";

export const metadata: Metadata = {
  title: "Salinha do Coach — Modo Foco Coletivo",
  description:
    "Salas silenciosas de coworking online. Sem chat, sem câmera, sem reação — só gente focando junto com você.",
};

// Ordem de seções espelha a estrutura da LP do Gather (ver
// docs/design-ref/gather.town): hero texto → visual grande do produto →
// prova social → como funciona (grid) → catálogo → CTA final → FAQ → footer.
// Copy, cena e dados são 100% nossos — nada de texto/imagem/logo do Gather.
export default function Home() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <ShowcaseSection />
        <section
          aria-label="Sessões de foco agora"
          className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6"
        >
          <h2 className="sr-only">Sessões de foco agora</h2>
          <LiveFocusCounter />
        </section>
        <HowItWorksSection />
        <RoomsPreviewSection />
        <FinalCtaSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </>
  );
}
