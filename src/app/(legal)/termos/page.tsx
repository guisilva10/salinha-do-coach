import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de uso — Salinha do Coach",
};

export default function TermosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </Link>
      <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Rascunho
      </span>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Termos de uso</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm text-muted-foreground sm:text-base">
        <p>
          Este documento ainda está em rascunho — a Salinha do Coach está em fase inicial e os
          termos definitivos serão publicados antes do lançamento oficial.
        </p>
        <p>
          Em linhas gerais: você usa a Salinha pra focar em silêncio ao lado de outras pessoas.
          Não há chat, câmera ou microfone — só presença. Sua conta é pessoal e intransferível, e
          esperamos que o espaço seja usado com respeito pelas outras pessoas presentes na sala.
        </p>
        <p>
          Se você tiver dúvidas sobre este rascunho, não assuma nenhum compromisso formal baseado
          neste texto até a versão definitiva ser publicada.
        </p>
      </div>
    </main>
  );
}
