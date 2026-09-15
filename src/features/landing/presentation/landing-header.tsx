"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export function LandingHeader() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Salinha do Coach
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isLoading ? (
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          ) : isAuthenticated ? (
            <Button
              render={<Link href="/dashboard" />}
              nativeButton={false}
              size="sm"
              className="min-h-11"
            >
              Ir pro dashboard
            </Button>
          ) : (
            <>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                size="sm"
                variant="ghost"
                className="hidden min-h-11 sm:inline-flex"
              >
                Já tenho conta
              </Button>
              <Button
                render={<Link href="/cadastro" />}
                nativeButton={false}
                size="sm"
                className="min-h-11"
              >
                Entrar na salinha
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
