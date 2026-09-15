"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvex } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signUpSchema,
  validateEmailField,
  validateSignUpPasswordField,
  validateUsernameField,
} from "@/features/auth/domain/auth-schemas";
import {
  NETWORK_ERROR_MESSAGE,
  isUsernameTakenError,
  mapSignUpError,
} from "@/features/auth/domain/auth-error-messages";

type SignUpField = "username" | "email" | "password";
type SignUpFieldErrors = Record<SignUpField, string | null>;

const INITIAL_FIELD_ERRORS: SignUpFieldErrors = {
  username: null,
  email: null,
  password: null,
};

const USERNAME_TAKEN_MESSAGE = "Esse nome de usuário já existe. Tenta outro?";
const USERNAME_CHECK_DEBOUNCE_MS = 400;

export function SignUpForm() {
  const router = useRouter();
  const convex = useConvex();
  const { signIn } = useAuthActions();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameCheckTokenRef = useRef(0);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>(INITIAL_FIELD_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) clearTimeout(usernameCheckTimeoutRef.current);
    };
  }, []);

  const scheduleUsernameAvailabilityCheck = (value: string) => {
    if (usernameCheckTimeoutRef.current) clearTimeout(usernameCheckTimeoutRef.current);

    const token = ++usernameCheckTokenRef.current;
    setIsCheckingUsername(true);

    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const isAvailable = await convex.query(api.users.isUsernameAvailable, {
          username: value,
        });
        if (usernameCheckTokenRef.current !== token) return; // resposta obsoleta (campo já mudou)
        setFieldErrors((previous) => ({
          ...previous,
          username: isAvailable ? null : USERNAME_TAKEN_MESSAGE,
        }));
      } catch {
        // Falha na checagem assíncrona não bloqueia o fluxo — o submit valida de novo no backend.
      } finally {
        if (usernameCheckTokenRef.current === token) setIsCheckingUsername(false);
      }
    }, USERNAME_CHECK_DEBOUNCE_MS);
  };

  const handleUsernameBlur = (value: string) => {
    const formatError = validateUsernameField(value);

    if (formatError) {
      if (usernameCheckTimeoutRef.current) clearTimeout(usernameCheckTimeoutRef.current);
      usernameCheckTokenRef.current += 1; // invalida qualquer checagem assíncrona pendente
      setIsCheckingUsername(false);
      setFieldErrors((previous) => ({ ...previous, username: formatError }));
      return;
    }

    setFieldErrors((previous) => ({ ...previous, username: null }));
    scheduleUsernameAvailabilityCheck(value);
  };

  const handleEmailBlur = (value: string) => {
    setFieldErrors((previous) => ({ ...previous, email: validateEmailField(value) }));
  };

  const handlePasswordBlur = (value: string) => {
    setFieldErrors((previous) => ({ ...previous, password: validateSignUpPasswordField(value) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFieldErrors: SignUpFieldErrors = {
      username: validateUsernameField(username),
      email: validateEmailField(email),
      password: validateSignUpPasswordField(password),
    };
    setFieldErrors(nextFieldErrors);

    const parsed = signUpSchema.safeParse({ username, email, password });
    if (!parsed.success) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      await signIn("password", {
        flow: "signUp",
        username: parsed.data.username,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      router.push("/dashboard");
    } catch (error) {
      const message = mapSignUpError(error);
      setFormError(message);
      setIsSubmitting(false);

      if (message === NETWORK_ERROR_MESSAGE) {
        toast.error(NETWORK_ERROR_MESSAGE);
      }

      if (isUsernameTakenError(error)) {
        setFieldErrors((previous) => ({ ...previous, username: USERNAME_TAKEN_MESSAGE }));
        usernameInputRef.current?.focus();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Acender minha luz</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          30 segundos, só usuário, email e senha.
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
        <Label htmlFor="username">Nome de usuário</Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="como_te_chamam"
            value={username}
            ref={usernameInputRef}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.username ? true : undefined}
            aria-describedby={fieldErrors.username ? "username-error" : undefined}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            onBlur={(event) => handleUsernameBlur(event.target.value)}
            className={isCheckingUsername ? "pr-10" : undefined}
          />
          {isCheckingUsername ? (
            <LoaderCircle
              aria-hidden="true"
              className="absolute inset-y-0 right-3 my-auto size-4 animate-spin text-muted-foreground"
            />
          ) : null}
        </div>
        {fieldErrors.username ? (
          <p id="username-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.username}
          </p>
        ) : null}
      </div>

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
            autoComplete="new-password"
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
            Acendendo sua luz...
          </>
        ) : (
          "Acender minha luz"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Ao continuar, você concorda com os Termos e a Política de Privacidade.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
