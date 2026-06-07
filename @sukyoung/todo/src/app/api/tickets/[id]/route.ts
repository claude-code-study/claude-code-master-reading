import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/middleware/errorHandler";
import { HttpError } from "@/server/middleware/httpError";
import { parseJson } from "@/server/middleware/validate";
import { ticketService } from "@/server/services/ticketService";
import { updateTicketSchema } from "@/shared/validations/ticket";

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

export const GET = async (_request: Request, context: RouteContext) => {
  try {
    const ticket = await ticketService.getById(await getTicketId(context));
    return NextResponse.json(ticket);
  } catch (error) {
    return handleRouteError(error);
  }
};

export const PATCH = async (request: Request, context: RouteContext) => {
  try {
    const input = await parseJson(request, updateTicketSchema);
    const ticket = await ticketService.update(await getTicketId(context), input);
    return NextResponse.json(ticket);
  } catch (error) {
    return handleRouteError(error);
  }
};

export const DELETE = async (_request: Request, context: RouteContext) => {
  try {
    await ticketService.delete(await getTicketId(context));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
};
