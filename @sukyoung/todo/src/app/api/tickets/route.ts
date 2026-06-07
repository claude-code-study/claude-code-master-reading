import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/middleware/errorHandler";
import { parseJson } from "@/server/middleware/validate";
import { toTicketResponse } from "@/server/serializers/ticket";
import { ticketService } from "@/server/services/ticketService";
import { createTicketSchema } from "@/shared/validations/ticket";

export const GET = async () => {
  try {
    const result = await ticketService.getAll();
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
};

export const POST = async (request: Request) => {
  try {
    const input = await parseJson(request, createTicketSchema);
    const ticket = await ticketService.create(input);
    return NextResponse.json(toTicketResponse(ticket), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
};
