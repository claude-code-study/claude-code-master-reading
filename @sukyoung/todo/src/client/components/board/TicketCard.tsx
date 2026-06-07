import { Badge } from "@/client/components/ui/Badge";
import type { TicketWithMeta } from "@/shared/types";

type TicketCardProps = {
  ticket: TicketWithMeta;
};

export const TicketCard = ({ ticket }: TicketCardProps) => {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-5 text-slate-950">
          {ticket.title}
        </h3>
        <Badge priority={ticket.priority} />
      </div>
      {ticket.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-600">
          {ticket.description}
        </p>
      ) : null}
      {ticket.dueDate ? (
        <p
          className={
            ticket.isOverdue
              ? "mt-3 text-xs font-medium text-red-600"
              : "mt-3 text-xs text-slate-500"
          }
        >
          Due {ticket.dueDate}
        </p>
      ) : null}
    </article>
  );
};
