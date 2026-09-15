import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/presentation/auth-layout";
import { LoginForm } from "@/features/auth/presentation/login-form";

export const metadata: Metadata = {
  title: "Entrar | Salinha do Coach",
  description: "Entre na sua conta e volte pra sua mesa de foco.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
