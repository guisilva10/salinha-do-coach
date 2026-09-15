"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, validateEmailField, validateRequiredField } from "@/features/auth/domain/auth-schemas";
import { mapLoginError } from "@/features/auth/domain/auth-error-messages";

type LoginField = "email" | "password";
type LoginFieldErrors = Record<LoginField, string | null>;

const INITIAL_FIELD_ERRORS: LoginFieldErrors = {
  email: null,
  password: null,
};

/**
 * Login é só por email (decisão de segurança — ver docs/ARCHITECTURE.md §13
 * e review do John): username é só nome de exibição, nunca identifica login,
 * pra não expor um endpoint capaz de vazar email a partir de username.
 */
export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>(INITIAL_FIELD_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailBlur = (value: string) => {
    setFieldErrors((previous) => ({ ...previous, email: validateEmailField(value) }));
  };

  const handlePasswordBlur = (value: string) => {
    setFieldErrors((previous) => ({ ...previous, password: validateRequiredField(value) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFieldErrors: LoginFieldErrors = {
      email: validateEmailField(email),
      password: validateRequiredField(password),
    };
    setFieldErrors(nextFieldErrors);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      await signIn("password", {
        flow: "signIn",
        email: parsed.data.email,
        password: parsed.data.password,
      });
      router.push("/dashboard");
    } catch (error) {
      setFormError(mapLoginError(error));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Entrar na salinha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Volte pra sua mesa e continue de onde parou.
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={(event) => handleEmailBlur(event.target.value)}
        />
        {fieldErrors.email ? (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={(event) => handlePasswordBlur(event.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {fieldErrors.password ? (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          "Entrar na salinha"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-foreground hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
