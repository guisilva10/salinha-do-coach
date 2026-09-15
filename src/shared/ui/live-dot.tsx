type LiveDotProps = {
  className?: string;
};

/**
 * Bolinha pulsante de indicador ao vivo — reusada em qualquer contador/card
 * que mostre presença real (dashboard, landing). Ver docs/DESIGN_DIRECTION.md
 * seção 8 (motion tokens). Componente único (dedup — antes duplicado em
 * features/landing e features/world).
 */
export function LiveDot({ className = "" }: LiveDotProps) {
  return (
    <span
      aria-hidden="true"
      className={["relative inline-flex h-2.5 w-2.5 shrink-0", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="absolute inset-0 rounded-full bg-foreground" />
      <span className="absolute inset-0 animate-ping rounded-full bg-foreground opacity-60 motion-reduce:animate-none" />
    </span>
  );
}
