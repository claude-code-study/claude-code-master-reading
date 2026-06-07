import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/middleware/errorHandler";
import { parseJson } from "@/server/middleware/validate";
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
    return NextResponse.json(
      {
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
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
};
