"use client";

import { Modal } from "@/client/components/ui/Modal";
import type { TicketWithMeta } from "@/shared/types";

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketWithMeta | null;
};

export const TicketModal = ({ isOpen, onClose, ticket }: TicketModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ticket?.title ?? "Ticket"}>
      {ticket ? (
        <div className="space-y-3 text-sm text-slate-600">
          <p>{ticket.description ?? "No description"}</p>
          <p>Priority: {ticket.priority}</p>
        </div>
      ) : null}
    </Modal>
  );
};
