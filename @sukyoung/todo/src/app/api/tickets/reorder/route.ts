import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/middleware/errorHandler";
import { parseJson } from "@/server/middleware/validate";
import { ticketService } from "@/server/services/ticketService";
import { reorderTicketSchema } from "@/shared/validations/ticket";

export const PATCH = async (request: Request) => {
  try {
    const input = await parseJson(request, reorderTicketSchema);
    const ticket = await ticketService.reorder(input);
    return NextResponse.json(ticket);
  } catch (error) {
    return handleRouteError(error);
  }
};
