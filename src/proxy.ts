import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Next.js 16 renomeou `middleware.ts` -> `proxy.ts` (export nomeado `proxy`
// em vez de default). `@convex-dev/auth` ainda documenta `middleware.ts` com
// export default, mas `convexAuthNextjsMiddleware(...)` só retorna uma
// função `(request, event) => Response | undefined` — mesma assinatura que
// `proxy.ts` espera. Adaptação é só de nome de arquivo/export.
// Não existe mais rota `/room/*` — é um mapa único em `/dashboard` (Fase 2).
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/login", "/cadastro"]);

export const proxy = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const authenticated = await convexAuth.isAuthenticated();

    if (isProtectedRoute(request) && !authenticated) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    if (isAuthRoute(request) && authenticated) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }
  },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
