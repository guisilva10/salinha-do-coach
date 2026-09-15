import Link from "next/link";
import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

// "Empresa" do padrão Gather virou "Conta" aqui: não temos páginas
// institucionais (Sobre, Carreiras) ainda, e inventar esses links seria
// fabricar conteúdo que não existe — os links reais desse grupo hoje são
// as ações de conta.
const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Salas", href: "/#salas" },
    ],
  },
  {
    title: "Recursos",
    links: [{ label: "Perguntas frequentes", href: "/#faq" }],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Criar conta", href: "/cadastro" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "/termos" },
      { label: "Privacidade", href: "/privacidade" },
    ],
  },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-extrabold tracking-tight">Salinha do Coach</p>
          <p className="text-sm text-muted-foreground">
            Salas silenciosas de coworking. Sem chat, sem câmera — só foco, junto.
          </p>
          <div className="mt-1 flex items-center gap-1">
            <SocialIcon icon={FaInstagram} label="Instagram (em breve)" />
            <SocialIcon icon={FaLinkedin} label="LinkedIn (em breve)" />
            <SocialIcon
              icon={FaGithub}
              label="GitHub"
              href="https://github.com/guisilva10/salinha-do-coach"
            />
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-sm font-bold">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            © {year} Salinha do Coach — Feito no Brasil
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

type SocialIconProps = {
  icon: IconType;
  label: string;
  href?: string;
};

function SocialIcon({ icon: Icon, label, href }: SocialIconProps) {
  if (!href) {
    return (
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground/40"
      >
        <Icon className="h-4 w-4" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
