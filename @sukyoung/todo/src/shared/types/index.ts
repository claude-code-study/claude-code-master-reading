import type { TicketPriority, TicketStatus } from "@/shared/constants";

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  position: number;
  plannedStartDate: string | null;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketWithMeta extends Ticket {
  isOverdue: boolean;
}

export interface CreateTicketInput {
  title: string;
  description?: string | null;
  priority?: TicketPriority;
  plannedStartDate?: string | null;
  dueDate?: string | null;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string | null;
  priority?: TicketPriority;
  plannedStartDate?: string | null;
  dueDate?: string | null;
}

export type ReorderableStatus = Exclude<TicketStatus, "DONE">;

export interface ReorderTicketInput {
  ticketId: number;
  status: ReorderableStatus;
  position: number;
}

export interface ReorderedTicketPosition {
  id: number;
  position: number;
}

export interface ReorderTicketResponse {
  ticket: TicketWithMeta;
  affected: ReorderedTicketPosition[];
}

export type BoardData = Record<TicketStatus, TicketWithMeta[]>;

export interface BoardResponse {
  board: BoardData;
  total: number;
}

export interface ApiErrorResponse {
  error: {
    code: "VALIDATION_ERROR" | "TICKET_NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
  };
}
