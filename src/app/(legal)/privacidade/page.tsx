import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidade — Salinha do Coach",
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </Link>
      <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Rascunho
      </span>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Privacidade</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm text-muted-foreground sm:text-base">
        <p>
          Este documento ainda está em rascunho — a política de privacidade definitiva, alinhada à
          LGPD, será publicada antes do lançamento oficial.
        </p>
        <p>
          Em linhas gerais: guardamos o essencial pra sua conta funcionar (usuário, email e sua
          presença nas salas) e nada além disso. A Salinha não tem chat, câmera ou microfone — não
          há gravação de conversa nenhuma, porque conversa não existe aqui dentro.
        </p>
        <p>
          Se você tiver dúvidas sobre este rascunho, não assuma nenhum compromisso formal baseado
          neste texto até a versão definitiva ser publicada.
        </p>
      </div>
    </main>
  );
}
