"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusCounter } from "./focus-counter";

/** HUD fixo no canto inferior direito — contador global + sair. */
export function WorldCornerHud() {
  const router = useRouter();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-20 flex items-center gap-3">
      <div className="pointer-events-auto rounded-lg border border-border bg-background/80 px-3 py-2 backdrop-blur">
        <FocusCounter />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="pointer-events-auto min-h-11 gap-1.5 bg-background/80 backdrop-blur"
        onClick={handleSignOut}
      >
        <LogOut className="size-4" aria-hidden="true" />
        Sair
      </Button>
    </div>
  );
}
