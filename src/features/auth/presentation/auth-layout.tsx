import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type AuthLayoutProps = {
  children: ReactNode;
};

// Posições das "mesas com lâmpada" do painel ambiente — decorativo, não é dado real
// (docs/DESIGN_DIRECTION.md seção 10: "continuidade de marca, não é alegação de prova social").
const LAMP_POSITIONS = [
  { x: 54, y: 118, delay: "0s" },
  { x: 138, y: 92, delay: "1.2s" },
  { x: 222, y: 124, delay: "2.4s" },
  { x: 306, y: 96, delay: "0.6s" },
];

/**
 * Layout compartilhado das telas de auth (/login, /cadastro) — painel ambiente
 * (conceito "sala escura / lâmpada", docs/DESIGN_DIRECTION.md seção 1) à esquerda
 * no desktop, faixa decorativa no topo no mobile.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div
        aria-hidden="true"
        className="relative h-28 w-full shrink-0 overflow-hidden bg-secondary md:h-auto md:w-[45%]"
      >
        <svg
          viewBox="0 0 360 160"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <rect x={0} y={140} width={360} height={20} className="fill-muted-foreground/10" />
          {LAMP_POSITIONS.map((lamp) => (
            <g key={`${lamp.x}-${lamp.y}`}>
              <rect
                x={lamp.x - 22}
                y={lamp.y + 10}
                width={44}
                height={14}
                rx={4}
                className="fill-muted-foreground/15"
              />
              <circle
                cx={lamp.x}
                cy={lamp.y}
                r={8}
                className="fill-foreground animate-pulse motion-reduce:animate-none"
                style={{ animationDelay: lamp.delay }}
              />
            </g>
          ))}
        </svg>
        <span className="absolute top-4 left-4 hidden text-xs font-semibold tracking-wide text-muted-foreground uppercase md:inline">
          Modo Foco Coletivo
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 md:px-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar pro início
          </Link>
          <Card className="rounded-[20px]">
            <CardContent className="px-(--card-spacing)">{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
