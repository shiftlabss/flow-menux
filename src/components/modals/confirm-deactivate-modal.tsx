"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";

export function ConfirmDeactivateModal() {
  const { modalType, modalData, closeModal } = useUIStore();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const isOpen = modalType === "confirm-deactivate";

  const description =
    (modalData?.description as string) ||
    "O usuário perderá acesso ao sistema. Você poderá reativá-lo posteriormente.";

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent className="max-w-[400px] rounded-[20px] p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-status-warning" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold text-black">
              Desativar usuário?
            </DialogTitle>
          </div>
          <DialogDescription className="mt-3 font-body text-sm text-zinc-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeModal()}
            disabled={isDeactivating}
            className="rounded-full font-heading text-sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={async () => {
              setIsDeactivating(true);
              try {
                if (modalData?.onConfirm && typeof modalData.onConfirm === "function") {
                  await Promise.resolve((modalData.onConfirm as () => void | Promise<void>)());
                }
                closeModal();
              } catch (error) {
                console.error("Error deactivating:", error);
              } finally {
                setIsDeactivating(false);
              }
            }}
            disabled={isDeactivating}
            className="rounded-full bg-status-warning font-heading text-sm text-white hover:bg-amber-600"
          >
            {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeactivating ? "Desativando..." : "Desativar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
