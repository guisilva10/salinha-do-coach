import { z } from "zod";

/**
 * Regras de validação — docs/DESIGN_DIRECTION.md seção 10 (tabela "Validação — onBlur, inline").
 * Schemas Zod validam o formato final antes do submit; os validators de campo abaixo
 * derivam a mesma regra pra checagem onBlur, respeitando a ordem de mensagem da tabela
 * (campo vazio sempre vira "obrigatório", só depois entra a regra de formato).
 */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_PATTERN = /^[a-z0-9_]+$/;
export const SIGN_UP_PASSWORD_MIN_LENGTH = 8;
const PASSWORD_HAS_DIGIT_PATTERN = /\d/;

const REQUIRED_FIELD_MESSAGE = "Esse campo é obrigatório.";
const USERNAME_FORMAT_MESSAGE = "Use só letras, números e _ (3 a 20 caracteres).";
const EMAIL_FORMAT_MESSAGE = "Digite um email válido.";
const SIGN_UP_PASSWORD_MESSAGE = "Sua senha precisa de pelo menos 8 caracteres, com 1 número.";

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH)
    .regex(USERNAME_PATTERN),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(SIGN_UP_PASSWORD_MIN_LENGTH).regex(PASSWORD_HAS_DIGIT_PATTERN),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Usado pro username no cadastro. */
export function validateUsernameField(value: string): string | null {
  if (value.trim().length === 0) return REQUIRED_FIELD_MESSAGE;

  const isValidFormat =
    value.length >= USERNAME_MIN_LENGTH &&
    value.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(value);

  return isValidFormat ? null : USERNAME_FORMAT_MESSAGE;
}

/** Usado pro email no cadastro. */
export function validateEmailField(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return REQUIRED_FIELD_MESSAGE;

  return z.email().safeParse(trimmed).success ? null : EMAIL_FORMAT_MESSAGE;
}

/** Usado pra senha no cadastro — obrigatório e regra de formato compartilham a mesma mensagem (doc, seção 10). */
export function validateSignUpPasswordField(value: string): string | null {
  const isValid =
    value.length >= SIGN_UP_PASSWORD_MIN_LENGTH && PASSWORD_HAS_DIGIT_PATTERN.test(value);

  return isValid ? null : SIGN_UP_PASSWORD_MESSAGE;
}

/** Usado pro identifier e senha no login — a única regra dos dois é "obrigatório". */
export function validateRequiredField(value: string): string | null {
  return value.trim().length === 0 ? REQUIRED_FIELD_MESSAGE : null;
}
