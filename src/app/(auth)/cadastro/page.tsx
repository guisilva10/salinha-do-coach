import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/presentation/auth-layout";
import { SignUpForm } from "@/features/auth/presentation/sign-up-form";

export const metadata: Metadata = {
  title: "Criar conta | Salinha do Coach",
  description: "Crie sua conta e acenda sua luz numa sala de foco silenciosa.",
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
