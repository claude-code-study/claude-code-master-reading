import { COLUMN_ORDER, TICKET_STATUS } from "@/shared/constants";
import type {
  BoardData,
  BoardResponse,
  CreateTicketInput,
  ReorderTicketResponse,
  ReorderTicketInput,
  Ticket,
  TicketWithMeta,
  UpdateTicketInput,
} from "@/shared/types";
import { HttpError } from "@/server/middleware/httpError";

let nextTicketId = 1;
const tickets: Ticket[] = [];

const createEmptyBoard = (): BoardData => ({
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  DONE: [],
});

const nowIso = () => new Date().toISOString();

const todayDateString = () => nowIso().slice(0, 10);

const isVisibleDoneTicket = (ticket: Ticket) => {
  if (ticket.status !== TICKET_STATUS.DONE) {
    return true;
  }

  if (!ticket.completedAt) {
    return false;
  }

  const completedAt = new Date(ticket.completedAt).getTime();
  return completedAt >= Date.now() - 24 * 60 * 60 * 1000;
};

const withMeta = (ticket: Ticket): TicketWithMeta => ({
  ...ticket,
  isOverdue:
    ticket.dueDate !== null &&
    ticket.dueDate < todayDateString() &&
    ticket.status !== TICKET_STATUS.DONE,
});

const findTicketIndex = (ticketId: number) => {
  const index = tickets.findIndex((ticket) => ticket.id === ticketId);

  if (index === -1) {
    throw new HttpError(404, "TICKET_NOT_FOUND", "티켓을 찾을 수 없습니다");
  }

  return index;
};

const getNextColumnPosition = (status: Ticket["status"]) => {
  const positions = tickets
    .filter((ticket) => ticket.status === status)
    .map((ticket) => ticket.position);

  return positions.length === 0 ? 1 : Math.min(...positions) - 1024;
};

export const ticketService = {
  getAll: async (): Promise<BoardResponse> => {
    const board = createEmptyBoard();

    tickets
      .filter(isVisibleDoneTicket)
      .map(withMeta)
      .sort((a, b) => a.position - b.position)
      .forEach((ticket) => {
        board[ticket.status].push(ticket);
      });

    return {
      board,
      total: COLUMN_ORDER.reduce((sum, status) => sum + board[status].length, 0),
    };
  },

  getById: async (ticketId: number): Promise<TicketWithMeta> => {
    return withMeta(tickets[findTicketIndex(ticketId)]);
  },

  create: async (input: CreateTicketInput): Promise<TicketWithMeta> => {
    const timestamp = nowIso();
    const ticket: Ticket = {
      id: nextTicketId,
      title: input.title,
      description: input.description ?? null,
      status: TICKET_STATUS.BACKLOG,
      priority: input.priority ?? "MEDIUM",
      position: getNextColumnPosition(TICKET_STATUS.BACKLOG),
      plannedStartDate: input.plannedStartDate ?? null,
      dueDate: input.dueDate ?? null,
      startedAt: null,
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    nextTicketId += 1;
    tickets.unshift(ticket);

    return withMeta(ticket);
  },

  update: async (
    ticketId: number,
    input: UpdateTicketInput,
  ): Promise<TicketWithMeta> => {
    const index = findTicketIndex(ticketId);
    const ticket = tickets[index];
    const updatedTicket: Ticket = {
      ...ticket,
      ...input,
      description:
        input.description === undefined ? ticket.description : input.description,
      plannedStartDate:
        input.plannedStartDate === undefined
          ? ticket.plannedStartDate
          : input.plannedStartDate,
      dueDate: input.dueDate === undefined ? ticket.dueDate : input.dueDate,
      updatedAt: nowIso(),
    };

    tickets[index] = updatedTicket;
    return withMeta(updatedTicket);
  },

  delete: async (ticketId: number): Promise<void> => {
    tickets.splice(findTicketIndex(ticketId), 1);
  },

  complete: async (ticketId: number): Promise<TicketWithMeta> => {
    const index = findTicketIndex(ticketId);
    const timestamp = nowIso();
    const updatedTicket: Ticket = {
      ...tickets[index],
      status: TICKET_STATUS.DONE,
      position: getNextColumnPosition(TICKET_STATUS.DONE),
      completedAt: timestamp,
      updatedAt: timestamp,
    };

    tickets[index] = updatedTicket;
    return withMeta(updatedTicket);
  },

  reorder: async (input: ReorderTicketInput): Promise<ReorderTicketResponse> => {
    const index = findTicketIndex(input.ticketId);
    const ticket = tickets[index];
    const timestamp = nowIso();
    const movedToTodo =
      input.status === TICKET_STATUS.TODO && ticket.status !== TICKET_STATUS.TODO;
    const movedBackToBacklog =
      input.status === TICKET_STATUS.BACKLOG &&
      ticket.status === TICKET_STATUS.TODO;
    const movedOutOfDone = ticket.status === TICKET_STATUS.DONE;

    const updatedTicket: Ticket = {
      ...ticket,
      status: input.status,
      position: input.position,
      startedAt: movedBackToBacklog
        ? null
        : movedToTodo
          ? timestamp
          : ticket.startedAt,
      completedAt: movedOutOfDone ? null : ticket.completedAt,
      updatedAt: timestamp,
    };

    tickets[index] = updatedTicket;
    return {
      ticket: withMeta(updatedTicket),
      affected: [],
    };
  },
};
