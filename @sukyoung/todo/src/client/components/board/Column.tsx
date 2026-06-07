import { TicketCard } from "@/client/components/board/TicketCard";
import { COLUMN_LABELS } from "@/shared/constants";
import type { TicketStatus } from "@/shared/constants";
import type { TicketWithMeta } from "@/shared/types";

type ColumnProps = {
  status: TicketStatus;
  tickets: TicketWithMeta[];
};

export const Column = ({ status, tickets }: ColumnProps) => {
  return (
    <section className="min-h-80 rounded-md border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          {COLUMN_LABELS[status]}
        </h2>
        <span className="text-xs font-medium text-slate-500">
          {tickets.length}
        </span>
      </header>
      <div className="flex flex-col gap-3 p-3">
        {tickets.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-400">
            Empty
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>
    </section>
  );
};
