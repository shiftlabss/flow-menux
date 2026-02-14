"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntelligenceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Intelligence Page Error]", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50">
      <div className="text-center max-w-md px-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-zinc-800 mb-2">
          Erro na Intelligence
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          {error.message || "Ocorreu um erro inesperado ao carregar o Jarvis."}
        </p>
        <Button onClick={reset} variant="outline">
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
