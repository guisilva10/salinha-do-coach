import type { Metadata } from "next";
import { DashboardWorld } from "@/features/world/presentation/components/dashboard-world";

export const metadata: Metadata = {
  title: "Escritório | Salinha do Coach",
  description: "Ande pelo escritório, sente numa cadeira e acenda sua luz.",
};

export default function DashboardPage() {
  return <DashboardWorld />;
}
