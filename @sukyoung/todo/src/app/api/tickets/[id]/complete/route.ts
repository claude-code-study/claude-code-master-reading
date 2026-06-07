import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/middleware/errorHandler";
import { HttpError } from "@/server/middleware/httpError";
import { toTicketResponse } from "@/server/serializers/ticket";
import { ticketService } from "@/server/services/ticketService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const getTicketId = async ({ params }: RouteContext) => {
  const { id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new HttpError(400, "VALIDATION_ERROR", "올바른 티켓 ID가 아닙니다");
  }

  return ticketId;
};

export const PATCH = async (_request: Request, context: RouteContext) => {
  try {
    const ticket = await ticketService.complete(await getTicketId(context));
    return NextResponse.json(toTicketResponse(ticket));
  } catch (error) {
    return handleRouteError(error);
  }
};
