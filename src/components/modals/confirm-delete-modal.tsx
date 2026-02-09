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

export function ConfirmDeleteModal() {
  const { modalType, modalData, closeModal } = useUIStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const isOpen = modalType === "confirm-delete";

  const description =
    (modalData?.description as string) ||
    "Esta ação não pode ser desfeita. O item será removido permanentemente.";

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent className="max-w-[400px] rounded-[20px] p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-status-danger" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold text-black">
              Tem certeza?
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
            disabled={isDeleting}
            className="rounded-full font-heading text-sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={async () => {
              setIsDeleting(true);
              try {
                // Execute delete callback if provided
                if (modalData?.onConfirm && typeof modalData.onConfirm === "function") {
                  await Promise.resolve((modalData.onConfirm as () => void | Promise<void>)());
                }
                closeModal();
              } catch (error) {
                console.error("Error deleting:", error);
              } finally {
                setIsDeleting(false);
              }
            }}
            disabled={isDeleting}
            className="rounded-full bg-status-danger font-heading text-sm text-white hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
