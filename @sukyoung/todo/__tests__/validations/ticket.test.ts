import { createTicketSchema } from "@/shared/validations/ticket";

const CREATE_TICKET_MESSAGES = {
  descriptionTooLong: "설명은 1000자 이내로 입력해주세요",
  dueDatePast: "종료예정일은 오늘 이후 날짜를 선택해주세요",
  invalidPriority: "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요",
  titleRequired: "제목을 입력해주세요",
  titleTooLong: "제목은 200자 이내로 입력해주세요",
} as const;

describe("createTicketSchema", () => {
  it("loads the create ticket schema", () => {
    expect(createTicketSchema).toBeDefined();
    expect(CREATE_TICKET_MESSAGES.titleRequired).toBe("제목을 입력해주세요");
  });

  it("accepts a minimal valid ticket input", () => {
    const result = createTicketSchema.parse({ title: "테스트 할일" });

    expect(result).toEqual({
      priority: "MEDIUM",
      title: "테스트 할일",
    });
  });

  it("accepts full valid create input", () => {
    const description = "a".repeat(1000);
    const result = createTicketSchema.parse({
      description,
      dueDate: "2099-01-01",
      plannedStartDate: "2026-06-07",
      priority: "HIGH",
      title: "API 설계 문서 작성",
    });

    expect(result).toEqual({
      description,
      dueDate: "2099-01-01",
      plannedStartDate: "2026-06-07",
      priority: "HIGH",
      title: "API 설계 문서 작성",
    });
  });

  it.each([
    [{}, CREATE_TICKET_MESSAGES.titleRequired],
    [{ title: "" }, CREATE_TICKET_MESSAGES.titleRequired],
    [{ title: "   " }, CREATE_TICKET_MESSAGES.titleRequired],
    [{ title: "a".repeat(201) }, CREATE_TICKET_MESSAGES.titleTooLong],
    [
      { description: "a".repeat(1001), title: "테스트 할일" },
      CREATE_TICKET_MESSAGES.descriptionTooLong,
    ],
    [
      { priority: "URGENT", title: "테스트 할일" },
      CREATE_TICKET_MESSAGES.invalidPriority,
    ],
    [
      { plannedStartDate: "2026/06/07", title: "테스트 할일" },
      "날짜는 YYYY-MM-DD 형식이어야 합니다",
    ],
    [
      { dueDate: "2020-01-01", title: "테스트 할일" },
      CREATE_TICKET_MESSAGES.dueDatePast,
    ],
  ])("rejects invalid create input %#", (input, message) => {
    const result = createTicketSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(message);
    }
  });
});
