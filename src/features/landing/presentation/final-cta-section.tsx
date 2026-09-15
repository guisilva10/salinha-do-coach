import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6"
    >
      <h2 id="final-cta-heading" className="text-balance text-2xl font-extrabold sm:text-3xl">
        Sua próxima sessão de foco pode começar agora.
      </h2>
      <div className="mt-6 flex justify-center">
        <Button render={<Link href="/cadastro" />} nativeButton={false} size="lg" className="min-h-11">
          Entrar na salinha
        </Button>
      </div>
    </section>
  );
}
