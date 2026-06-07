import {
  ReadableStream,
  TransformStream,
  WritableStream,
} from "node:stream/web";
import { TextDecoder, TextEncoder } from "node:util";

type FetchPrimitives = typeof import("next/dist/compiled/@edge-runtime/primitives/fetch");

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

const loadTicketsRoute = async () => {
  jest.resetModules();
  installFetchPrimitives();
  return import("@/app/api/tickets/route");
};

const createJsonRequest = (body: unknown) => {
  installFetchPrimitives();
  const { Request } = getFetchPrimitives();

  return new Request("http://localhost/api/tickets", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
};

const readJsonResponse = async (response: Response) => {
  return {
    body: await response.json(),
    status: response.status,
  };
};

const expectedValidationError = (message: string) => ({
  error: {
    code: "VALIDATION_ERROR",
    message,
  },
});

const validTicketInput = (overrides: Record<string, unknown> = {}) => ({
  title: "테스트 할일",
  ...overrides,
});

describe("POST /api/tickets", () => {
  it("loads the route and request helpers", async () => {
    const route = await loadTicketsRoute();
    const request = createJsonRequest({ title: "테스트 할일" });
    const { Response } = getFetchPrimitives();
    const parsed = await readJsonResponse(
      Response.json({ ok: true }, { status: 201 }),
    );

    expect(route.POST).toBeDefined();
    expect(request.method).toBe("POST");
    expect(validTicketInput()).toEqual({ title: "테스트 할일" });
    expect(expectedValidationError("제목을 입력해주세요")).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "제목을 입력해주세요",
      },
    });
    expect(parsed).toEqual({ body: { ok: true }, status: 201 });
  });

  it("creates a ticket with required fields only", async () => {
    const route = await loadTicketsRoute();
    const response = await route.POST(createJsonRequest(validTicketInput()));
    const { body, status } = await readJsonResponse(response);

    expect(status).toBe(201);
    expect(body).toMatchObject({
      completedAt: null,
      description: null,
      dueDate: null,
      plannedStartDate: null,
      priority: "MEDIUM",
      startedAt: null,
      status: "BACKLOG",
      title: "테스트 할일",
    });
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("position");
    expect(body).toHaveProperty("createdAt");
    expect(body).toHaveProperty("updatedAt");
    expect(body).not.toHaveProperty("isOverdue");
  });

  it("creates a ticket with full details", async () => {
    const route = await loadTicketsRoute();
    const response = await route.POST(
      createJsonRequest(
        validTicketInput({
          description: "REST API 엔드포인트와 요청/응답 형식을 정의한다",
          dueDate: "2099-01-01",
          plannedStartDate: "2026-06-07",
          priority: "HIGH",
          title: "API 설계 문서 작성",
        }),
      ),
    );
    const { body, status } = await readJsonResponse(response);

    expect(status).toBe(201);
    expect(body).toMatchObject({
      description: "REST API 엔드포인트와 요청/응답 형식을 정의한다",
      dueDate: "2099-01-01",
      plannedStartDate: "2026-06-07",
      priority: "HIGH",
      status: "BACKLOG",
      title: "API 설계 문서 작성",
    });
    expect(body).not.toHaveProperty("isOverdue");
  });

  it.each([
    [{}, "제목을 입력해주세요"],
    [{ title: "" }, "제목을 입력해주세요"],
    [{ title: "   " }, "제목을 입력해주세요"],
    [{ title: "a".repeat(201) }, "제목은 200자 이내로 입력해주세요"],
  ])("rejects invalid title input %#", async (input, message) => {
    const route = await loadTicketsRoute();
    const response = await route.POST(createJsonRequest(input));
    const { body, status } = await readJsonResponse(response);

    expect(status).toBe(400);
    expect(body).toEqual(expectedValidationError(message));
  });

  it.each([
    [
      { description: "a".repeat(1001), title: "테스트 할일" },
      "설명은 1000자 이내로 입력해주세요",
    ],
    [
      { priority: "URGENT", title: "테스트 할일" },
      "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요",
    ],
    [
      { dueDate: "2020-01-01", title: "테스트 할일" },
      "종료예정일은 오늘 이후 날짜를 선택해주세요",
    ],
  ])("rejects invalid optional input %#", async (input, message) => {
    const route = await loadTicketsRoute();
    const response = await route.POST(createJsonRequest(input));
    const { body, status } = await readJsonResponse(response);

    expect(status).toBe(400);
    expect(body).toEqual(expectedValidationError(message));
  });

  it("does not call the create service when validation fails", async () => {
    const route = await loadTicketsRoute();
    const { ticketService } = await import("@/server/services/ticketService");
    const createSpy = jest.spyOn(ticketService, "create");

    const response = await route.POST(createJsonRequest({ title: "   " }));
    const { status } = await readJsonResponse(response);

    expect(status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });
});
