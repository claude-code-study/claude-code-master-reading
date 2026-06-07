"use client";

import { useState } from "react";
import { Button } from "@/client/components/ui/Button";
import { TICKET_PRIORITY } from "@/shared/constants";
import type { CreateTicketInput } from "@/shared/types";

type TicketFormProps = {
  onSubmit: (input: CreateTicketInput) => Promise<void> | void;
};

export const TicketForm = ({ onSubmit }: TicketFormProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      title,
      priority: TICKET_PRIORITY.MEDIUM,
    });

    setTitle("");
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        maxLength={200}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Ticket title"
        required
        value={title}
      />
      <Button type="submit">Create</Button>
    </form>
  );
};
