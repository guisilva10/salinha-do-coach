import { LayoutGrid, Sparkles, UserPlus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SectionEyebrow } from "./section-eyebrow";

type Step = {
  icon: typeof UserPlus;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    description: "30 segundos, só usuário, email e senha.",
  },
  {
    icon: LayoutGrid,
    title: "Escolha uma sala",
    description: "Biblioteca, café ou estúdio — você escolhe o clima.",
  },
  {
    icon: Sparkles,
    title: "Sente e foque",
    description: "Acenda sua luz e trabalhe em silêncio, do seu jeito.",
  },
];

// Estrutura de referência: seção "features-grid" do Gather
// (docs/design-ref/gather.town) — eyebrow + H2 + subhead + grid de cards
// com visual + título + descrição.
export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="how-it-works-heading"
      className="mx-auto w-full max-w-5xl scroll-mt-16 px-4 py-16 text-center sm:px-6"
    >
      <SectionEyebrow>3 passos</SectionEyebrow>
      <h2 id="how-it-works-heading" className="mt-4 text-3xl font-extrabold sm:text-4xl">
        Como funciona
      </h2>
      <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.title}>
            <CardContent className="flex flex-col gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
                <step.icon className="h-5 w-5 text-foreground" aria-hidden="true" />
              </span>
              <CardTitle className="text-base">{step.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mx-auto mt-14 max-w-2xl text-left sm:text-center">
        <p className="text-lg font-bold">Por que não tem chat, nem câmera, nem reação?</p>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Porque a sensação de &quot;não estou só&quot; não vem de conversa — vem de saber que, do
          outro lado da tela, tem gente no mesmo silêncio, com o mesmo objetivo que o seu. Ninguém
          te interrompe. Ninguém te cobra. Só o barulho da sua própria produtividade.
        </p>
      </div>
    </section>
  );
}
