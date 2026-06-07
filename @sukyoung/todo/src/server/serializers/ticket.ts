import type { Ticket, TicketWithMeta } from "@/shared/types";

export const toTicketResponse = (ticket: Ticket | TicketWithMeta): Ticket => ({
  id: ticket.id,
  title: ticket.title,
  description: ticket.description,
  status: ticket.status,
  priority: ticket.priority,
  position: ticket.position,
  plannedStartDate: ticket.plannedStartDate,
  dueDate: ticket.dueDate,
  startedAt: ticket.startedAt,
  completedAt: ticket.completedAt,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});
