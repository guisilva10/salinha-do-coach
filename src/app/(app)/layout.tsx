import type { ReactNode } from "react";

// Sem header/chrome aqui de propósito: /dashboard é o mapa em tela cheia
// (WorldScene) com tudo em HUD sobreposto (DashboardWorld cuida disso).
export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden">{children}</div>;
}
