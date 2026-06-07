import type { TicketPriority } from "@/shared/constants";
import { PRIORITY_LABELS } from "@/shared/constants";

type BadgeProps = {
  priority: TicketPriority;
};

const priorityClasses: Record<TicketPriority, string> = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-sky-200 bg-sky-50 text-sky-700",
  HIGH: "border-red-200 bg-red-50 text-red-700",
};

export const Badge = ({ priority }: BadgeProps) => {
  return (
    <span
      className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${priorityClasses[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
};
