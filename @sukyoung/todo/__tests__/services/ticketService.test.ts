const loadTicketService = async () => {
  jest.resetModules();
  const ticketServiceModule = await import("@/server/services/ticketService");
  return ticketServiceModule.ticketService;
};

describe("ticketService", () => {
  it("creates a ticket in backlog", async () => {
    const ticketService = await loadTicketService();
    const ticket = await ticketService.create({
      title: "테스트 티켓",
    });

    expect(ticket.status).toBe("BACKLOG");
    expect(ticket.title).toBe("테스트 티켓");
    expect(ticket.priority).toBe("MEDIUM");
    expect(ticket.description).toBeNull();
    expect(ticket.plannedStartDate).toBeNull();
    expect(ticket.dueDate).toBeNull();
    expect(ticket.startedAt).toBeNull();
    expect(ticket.completedAt).toBeNull();
    expect(typeof ticket.createdAt).toBe("string");
    expect(typeof ticket.updatedAt).toBe("string");
  });

  it("preserves full details and places newer backlog tickets above older ones", async () => {
    const ticketService = await loadTicketService();
    const firstTicket = await ticketService.create({
      title: "첫 번째 티켓",
    });
    const secondTicket = await ticketService.create({
      description: "REST API 엔드포인트와 요청/응답 형식을 정의한다",
      dueDate: "2026-06-08",
      plannedStartDate: "2026-06-07",
      priority: "HIGH",
      title: "API 설계 문서 작성",
    });

    expect(secondTicket).toMatchObject({
      description: "REST API 엔드포인트와 요청/응답 형식을 정의한다",
      dueDate: "2026-06-08",
      plannedStartDate: "2026-06-07",
      priority: "HIGH",
      status: "BACKLOG",
      title: "API 설계 문서 작성",
    });
    expect(secondTicket.position).toBeLessThan(firstTicket.position);
  });
});
