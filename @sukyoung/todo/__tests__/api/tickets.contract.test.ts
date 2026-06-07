import {
  ReadableStream,
  TransformStream,
  WritableStream,
} from "node:stream/web";
import { TextDecoder, TextEncoder } from "node:util";
import type { BoardResponse, Ticket, TicketWithMeta } from "@/shared/types";

type FetchPrimitives = typeof import("next/dist/compiled/@edge-runtime/primitives/fetch");
type TicketRouteContext = {
  params: Promise<{
    id: string;
  }>;
};
type ReorderResponse = {
  ticket: Ticket;
  affected: Array<{
    id: number;
    position: number;
  }>;
};

let fetchPrimitives: FetchPrimitives | undefined;

const getFetchPrimitives = () => {
  Object.defineProperties(globalThis, {
    ReadableStream: { configurable: true, value: ReadableStream },
    TextDecoder: { configurable: true, value: TextDecoder },
    TextEncoder: { configurable: true, value: TextEncoder },
    TransformStream: { configurable: true, value: TransformStream },
    WritableStream: { configurable: true, value: WritableStream },
  });

  fetchPrimitives ??= jest.requireActual<FetchPrimitives>(
    "next/dist/compiled/@edge-runtime/primitives/fetch",
  );

  return fetchPrimitives;
};

const installFetchPrimitives = () => {
  const { Headers, Request, Response } = getFetchPrimitives();

  Object.defineProperties(globalThis, {
    Headers: { configurable: true, value: Headers },
    Request: { configurable: true, value: Request },
    Response: { configurable: true, value: Response },
  });
};

const loadApiRoutes = async () => {
  jest.resetModules();
  installFetchPrimitives();

  const [ticketsRoute, ticketByIdRoute, completeRoute, reorderRoute] =
    await Promise.all([
      import("@/app/api/tickets/route"),
      import("@/app/api/tickets/[id]/route"),
      import("@/app/api/tickets/[id]/complete/route"),
      import("@/app/api/tickets/reorder/route"),
    ]);

  return {
    completeRoute,
    reorderRoute,
    ticketByIdRoute,
    ticketsRoute,
  };
};

const createRequest = (path: string, method: string) => {
  installFetchPrimitives();
  const { Request } = getFetchPrimitives();

  return new Request(`http://localhost${path}`, { method });
};

const createJsonRequest = (
  path: string,
  method: string,
  body: unknown,
) => {
  installFetchPrimitives();
  const { Request } = getFetchPrimitives();

  return new Request(`http://localhost${path}`, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method,
  });
};

const routeContext = (id: number | string): TicketRouteContext => ({
  params: Promise.resolve({ id: String(id) }),
});

const readJsonResponse = async <TBody>(response: Response) => ({
  body: (await response.json()) as TBody,
  status: response.status,
});

const createTicket = async (
  ticketsRoute: Awaited<ReturnType<typeof loadApiRoutes>>["ticketsRoute"],
  input: Record<string, unknown>,
) => {
  const response = await ticketsRoute.POST(
    createJsonRequest("/api/tickets", "POST", input),
  );

  return readJsonResponse<Ticket>(response);
};

describe("API_SPEC endpoint coverage", () => {
  it("exposes the 7 route handlers defined in docs/API_SPEC.md", async () => {
    const { completeRoute, reorderRoute, ticketByIdRoute, ticketsRoute } =
      await loadApiRoutes();

    expect(typeof ticketsRoute.POST).toBe("function");
    expect(typeof ticketsRoute.GET).toBe("function");
    expect(typeof ticketByIdRoute.GET).toBe("function");
    expect(typeof ticketByIdRoute.PATCH).toBe("function");
    expect(typeof completeRoute.PATCH).toBe("function");
    expect(typeof ticketByIdRoute.DELETE).toBe("function");
    expect(typeof reorderRoute.PATCH).toBe("function");
  });

  it("GET /api/tickets returns grouped board data with total and isOverdue", async () => {
    const { ticketsRoute } = await loadApiRoutes();
    await createTicket(ticketsRoute, {
      priority: "LOW",
      title: "첫 번째 티켓",
    });
    await createTicket(ticketsRoute, {
      priority: "HIGH",
      title: "두 번째 티켓",
    });

    const response = await ticketsRoute.GET();
    const { body, status } = await readJsonResponse<BoardResponse>(response);

    expect(status).toBe(200);
    expect(Object.keys(body.board)).toEqual([
      "BACKLOG",
      "TODO",
      "IN_PROGRESS",
      "DONE",
    ]);
    expect(body.total).toBe(2);
    expect(body.board.BACKLOG.map((ticket) => ticket.title)).toEqual([
      "두 번째 티켓",
      "첫 번째 티켓",
    ]);
    expect(body.board.BACKLOG[0]?.isOverdue).toBe(false);
  });

  it("GET /api/tickets/:id returns ticket details with isOverdue", async () => {
    const { ticketByIdRoute, ticketsRoute } = await loadApiRoutes();
    const created = await createTicket(ticketsRoute, {
      dueDate: "2099-01-01",
      priority: "HIGH",
      title: "상세 조회 티켓",
    });

    const response = await ticketByIdRoute.GET(
      createRequest(`/api/tickets/${created.body.id}`, "GET"),
      routeContext(created.body.id),
    );
    const { body, status } = await readJsonResponse<TicketWithMeta>(response);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      dueDate: "2099-01-01",
      id: created.body.id,
      isOverdue: false,
      priority: "HIGH",
      title: "상세 조회 티켓",
    });
  });

  it("PATCH /api/tickets/:id updates editable fields only", async () => {
    const { ticketByIdRoute, ticketsRoute } = await loadApiRoutes();
    const created = await createTicket(ticketsRoute, {
      description: "초기 설명",
      plannedStartDate: "2099-01-01",
      title: "수정 전 티켓",
    });

    const response = await ticketByIdRoute.PATCH(
      createJsonRequest(`/api/tickets/${created.body.id}`, "PATCH", {
        description: null,
        dueDate: "2099-01-02",
        plannedStartDate: null,
        priority: "LOW",
        status: "DONE",
        title: "수정 후 티켓",
      }),
      routeContext(created.body.id),
    );
    const { body, status } = await readJsonResponse<TicketWithMeta>(response);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      description: null,
      dueDate: "2099-01-02",
      id: created.body.id,
      isOverdue: false,
      plannedStartDate: null,
      priority: "LOW",
      status: "BACKLOG",
      title: "수정 후 티켓",
    });
  });

  it("PATCH /api/tickets/:id/complete marks Done and places latest completion on top", async () => {
    const { completeRoute, ticketsRoute } = await loadApiRoutes();
    const first = await createTicket(ticketsRoute, { title: "먼저 완료" });
    const second = await createTicket(ticketsRoute, { title: "나중 완료" });

    const firstResponse = await completeRoute.PATCH(
      createRequest(`/api/tickets/${first.body.id}/complete`, "PATCH"),
      routeContext(first.body.id),
    );
    const secondResponse = await completeRoute.PATCH(
      createRequest(`/api/tickets/${second.body.id}/complete`, "PATCH"),
      routeContext(second.body.id),
    );
    const firstCompleted =
      await readJsonResponse<Ticket>(firstResponse);
    const secondCompleted =
      await readJsonResponse<Ticket>(secondResponse);

    expect(firstCompleted.status).toBe(200);
    expect(secondCompleted.status).toBe(200);
    expect(secondCompleted.body.status).toBe("DONE");
    expect(secondCompleted.body.completedAt).toEqual(expect.any(String));
    expect(secondCompleted.body.position).toBeLessThan(
      firstCompleted.body.position,
    );
    expect(secondCompleted.body).not.toHaveProperty("isOverdue");
  });

  it("DELETE /api/tickets/:id removes the ticket and returns 204", async () => {
    const { ticketByIdRoute, ticketsRoute } = await loadApiRoutes();
    const created = await createTicket(ticketsRoute, {
      title: "삭제할 티켓",
    });

    const response = await ticketByIdRoute.DELETE(
      createRequest(`/api/tickets/${created.body.id}`, "DELETE"),
      routeContext(created.body.id),
    );

    expect(response.status).toBe(204);

    const getResponse = await ticketByIdRoute.GET(
      createRequest(`/api/tickets/${created.body.id}`, "GET"),
      routeContext(created.body.id),
    );
    const notFound = await readJsonResponse<{
      error: { code: string; message: string };
    }>(getResponse);

    expect(notFound.status).toBe(404);
    expect(notFound.body).toEqual({
      error: {
        code: "TICKET_NOT_FOUND",
        message: "티켓을 찾을 수 없습니다",
      },
    });
  });

  it("PATCH /api/tickets/reorder changes status and position with the documented envelope", async () => {
    const { reorderRoute, ticketsRoute } = await loadApiRoutes();
    const created = await createTicket(ticketsRoute, {
      title: "이동할 티켓",
    });

    const response = await reorderRoute.PATCH(
      createJsonRequest("/api/tickets/reorder", "PATCH", {
        position: 512,
        status: "TODO",
        ticketId: created.body.id,
      }),
    );
    const { body, status } = await readJsonResponse<ReorderResponse>(response);

    expect(status).toBe(200);
    expect(body).toEqual({
      affected: [],
      ticket: expect.objectContaining({
        completedAt: null,
        id: created.body.id,
        position: 512,
        startedAt: expect.any(String),
        status: "TODO",
        title: "이동할 티켓",
      }),
    });
    expect(body.ticket).not.toHaveProperty("isOverdue");
  });

  it("PATCH /api/tickets/reorder rejects DONE status with API_SPEC message", async () => {
    const { reorderRoute } = await loadApiRoutes();

    const response = await reorderRoute.PATCH(
      createJsonRequest("/api/tickets/reorder", "PATCH", {
        position: 0,
        status: "DONE",
        ticketId: 1,
      }),
    );
    const { body, status } = await readJsonResponse<{
      error: { code: string; message: string };
    }>(response);

    expect(status).toBe(400);
    expect(body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요",
      },
    });
  });
});
