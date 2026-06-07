import { ticketService } from "@/server/services/ticketService";

describe("ticketService", () => {
  it("creates a ticket in backlog", async () => {
    const ticket = await ticketService.create({
      title: "테스트 티켓",
    });

    expect(ticket.status).toBe("BACKLOG");
    expect(ticket.title).toBe("테스트 티켓");
  });
});
