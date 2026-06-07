import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/middleware/errorHandler";
import { parseJson } from "@/server/middleware/validate";
import { toTicketResponse } from "@/server/serializers/ticket";
import { ticketService } from "@/server/services/ticketService";
import { reorderTicketSchema } from "@/shared/validations/ticket";

export const PATCH = async (request: Request) => {
  try {
    const input = await parseJson(request, reorderTicketSchema);
    const result = await ticketService.reorder(input);
    return NextResponse.json({
      ticket: toTicketResponse(result.ticket),
      affected: result.affected,
    });
  } catch (error) {
    return handleRouteError(error);
  }
};
