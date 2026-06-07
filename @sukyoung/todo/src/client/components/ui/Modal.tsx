"use client";

import { Button } from "@/client/components/ui/Button";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export const Modal = ({ children, isOpen, onClose, title }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section className="w-full max-w-lg rounded-md bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="p-4">{children}</div>
      </section>
    </div>
  );
};
