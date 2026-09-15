import Link from "next/link";
import { Lamp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Estrutura de referência: hero do Gather (docs/design-ref/gather.town) é só
// texto + CTA — o visual grande do produto vira uma seção própria logo
// abaixo (ver ShowcaseSection), não fica espremido dentro do hero.
export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pt-16 pb-8 text-center sm:px-6 sm:pt-24">
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Lamp className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
        Modo Foco Coletivo
      </span>
      <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
        Foco não precisa de sala vazia.
      </h1>
      <p className="max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
        Entre numa sala silenciosa e sente ao lado de outras pessoas focando no mesmo horário que
        você. Sem chat. Sem câmera. Sem desculpa.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button render={<Link href="/cadastro" />} nativeButton={false} size="lg" className="min-h-11">
          Entrar na salinha
        </Button>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          size="lg"
          variant="outline"
          className="min-h-11"
        >
          Já tenho conta
        </Button>
      </div>
    </section>
  );
}
