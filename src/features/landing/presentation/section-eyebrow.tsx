import type { ReactNode } from "react";

type SectionEyebrowProps = {
  children: ReactNode;
};

/**
 * Pílula pequena acima de headings de seção — ritmo repetido ao longo da LP
 * (estrutura de referência: docs/design-ref/gather.town). P&B puro: só
 * tokens shadcn (border/foreground/muted-foreground), sem cor de destaque.
 */
export function SectionEyebrow({ children }: SectionEyebrowProps) {
  return (
    <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden="true" />
      {children}
    </span>
  );
}
