"use client";

import { Button } from "@/client/components/ui/Button";
import { Modal } from "@/client/components/ui/Modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export const ConfirmDialog = ({
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex justify-end gap-2">
          <Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
};
