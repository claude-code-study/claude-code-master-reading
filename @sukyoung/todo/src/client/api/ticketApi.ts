import type {
  BoardResponse,
  CreateTicketInput,
  ReorderTicketInput,
  TicketWithMeta,
  UpdateTicketInput,
} from "@/shared/types";

const requestJson = async <TResponse>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TResponse> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
};

export const ticketApi = {
  fetchTickets: async () => requestJson<BoardResponse>("/api/tickets"),

  createTicket: async (input: CreateTicketInput) =>
    requestJson<TicketWithMeta>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateTicket: async (ticketId: number, input: UpdateTicketInput) =>
    requestJson<TicketWithMeta>(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteTicket: async (ticketId: number) => {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
  },

  completeTicket: async (ticketId: number) =>
    requestJson<TicketWithMeta>(`/api/tickets/${ticketId}/complete`, {
      method: "PATCH",
    }),

  reorderTicket: async (input: ReorderTicketInput) =>
    requestJson<TicketWithMeta>("/api/tickets/reorder", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
