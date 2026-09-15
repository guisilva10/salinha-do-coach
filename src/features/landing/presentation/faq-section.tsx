import { SectionEyebrow } from "./section-eyebrow";

type FaqItem = {
  question: string;
  answer: string;
};

// Estrutura de referência: seção FAQ do Gather (docs/design-ref/gather.town)
// — eyebrow + H2 + lista de perguntas. Só perguntas que dá pra responder com
// fato real do produto hoje (sem chat/câmera, precisa de conta, funciona no
// celular) — nada sobre preço, já que isso ainda não foi decidido.
const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Preciso ficar com a câmera ligada?",
    answer: "Não. A Salinha não tem chat, câmera nem microfone — só presença silenciosa.",
  },
  {
    question: "Preciso criar uma conta?",
    answer: "Sim, rapidinho: usuário, email e senha. Sem isso não dá pra sentar numa sala.",
  },
  {
    question: "Funciona no celular?",
    answer: "Funciona direto no navegador do celular — mobile-first desde o primeiro dia.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-3xl scroll-mt-16 px-4 py-16 sm:px-6"
    >
      <div className="text-center">
        <SectionEyebrow>Tire suas dúvidas</SectionEyebrow>
        <h2 id="faq-heading" className="mt-4 text-3xl font-extrabold sm:text-4xl">
          Perguntas frequentes
        </h2>
      </div>
      <dl className="mt-10 flex flex-col gap-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} className="rounded-lg border border-border p-4">
            <dt className="font-bold">{item.question}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
