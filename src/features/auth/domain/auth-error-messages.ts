import { ConvexError } from "convex/values";

/**
 * Mapeamento de erros de submit (não de campo) pra mensagens pt-BR —
 * docs/DESIGN_DIRECTION.md seção 10 ("Erros de submissão").
 *
 * Erros de negócio no MVP são sempre `ConvexError` (ver convex/auth.ts e
 * convex/users.ts da Lorraine) — o client acessa a mensagem original via
 * `error.data`. Qualquer outro erro (Error genérico, falha de rede) chega
 * redigido como "Server Error" em produção (doc oficial do Convex: erros que
 * não são ConvexError só mostram detalhe em dev), então NUNCA tentamos casar
 * string nesses casos — tratamos como erro genérico de conexão/credenciais.
 */

// Login: em produção o provider Password nativo não usa ConvexError pro caso
// "credenciais inválidas" (vira "Server Error" redigido) — por isso não tentamos
// casar a mensagem de erro do signIn de login, e usamos sempre a mesma mensagem
// genérica (nunca indicar qual campo está errado, evita enumeração de contas).
export const GENERIC_LOGIN_ERROR_MESSAGE = "Email/usuário ou senha incorretos.";
const USERNAME_TAKEN_MESSAGE = "Esse nome de usuário já existe. Tenta outro?";
const USERNAME_INVALID_MESSAGE = "Use só letras, números e _ (3 a 20 caracteres).";
const EMAIL_INVALID_MESSAGE = "Digite um email válido.";
const WEAK_PASSWORD_MESSAGE = "Sua senha precisa de pelo menos 8 caracteres, com 1 número.";
export const NETWORK_ERROR_MESSAGE =
  "Não conseguimos conectar agora. Tenta de novo em alguns segundos.";

// Mensagens exatas lançadas hoje em convex/auth.ts (Lorraine) via `new ConvexError("...")`.
const USERNAME_TAKEN_DATA = "Esse nome de usuario ja existe.";
const USERNAME_INVALID_DATA = "Nome de usuario invalido. Use 3 a 20 letras, numeros ou _.";
const EMAIL_INVALID_DATA = "Email invalido.";
const WEAK_PASSWORD_DATA = "A senha precisa ter pelo menos 8 caracteres e 1 numero.";

function getConvexErrorData(error: unknown): string | null {
  if (!(error instanceof ConvexError)) return null;
  return typeof error.data === "string" ? error.data : null;
}

export function mapSignUpError(error: unknown): string {
  const data = getConvexErrorData(error);

  if (data === USERNAME_TAKEN_DATA) return USERNAME_TAKEN_MESSAGE;
  if (data === USERNAME_INVALID_DATA) return USERNAME_INVALID_MESSAGE;
  if (data === EMAIL_INVALID_DATA) return EMAIL_INVALID_MESSAGE;
  if (data === WEAK_PASSWORD_DATA) return WEAK_PASSWORD_MESSAGE;

  return NETWORK_ERROR_MESSAGE;
}

/** Decide se o foco deve voltar pro campo username após erro de submit (doc: "corrida" de unicidade). */
export function isUsernameTakenError(error: unknown): boolean {
  return getConvexErrorData(error) === USERNAME_TAKEN_DATA;
}

// Adicionado pela Lorraine pra desbloquear o build — login-form.tsx importava
// esta função e ela não existia ainda. Login nunca indica qual campo errou
// (evita enumeração de contas), então a mensagem é sempre genérica; só um
// erro que claramente não é de credenciais (rede/conexão) usa a outra mensagem.
export function mapLoginError(error: unknown): string {
  if (error instanceof Error && /network|fetch|failed to connect/i.test(error.message)) {
    return NETWORK_ERROR_MESSAGE;
  }
  return GENERIC_LOGIN_ERROR_MESSAGE;
}
