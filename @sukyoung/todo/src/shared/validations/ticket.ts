import { z } from "zod";
import { TICKET_PRIORITY, TICKET_STATUS } from "@/shared/constants";

const TICKET_VALIDATION_MESSAGES = {
  dateFormat: "날짜는 YYYY-MM-DD 형식이어야 합니다",
  descriptionTooLong: "설명은 1000자 이내로 입력해주세요",
  dueDatePast: "종료예정일은 오늘 이후 날짜를 선택해주세요",
  invalidPriority: "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요",
  invalidReorderStatus: "상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요",
  titleRequired: "제목을 입력해주세요",
  titleTooLong: "제목은 200자 이내로 입력해주세요",
} as const;

const todayInSeoul = () => {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, TICKET_VALIDATION_MESSAGES.dateFormat);

const nullableDateSchema = dateSchema.nullable();

const dueDateSchema = dateSchema.refine(
  (value) => value >= todayInSeoul(),
  TICKET_VALIDATION_MESSAGES.dueDatePast,
);

const nullableDueDateSchema = dueDateSchema.nullable();

const titleSchema = z
  .string({
    invalid_type_error: TICKET_VALIDATION_MESSAGES.titleRequired,
    required_error: TICKET_VALIDATION_MESSAGES.titleRequired,
  })
  .trim()
  .min(1, TICKET_VALIDATION_MESSAGES.titleRequired)
  .max(200, TICKET_VALIDATION_MESSAGES.titleTooLong);

const descriptionSchema = z
  .string()
  .max(1000, TICKET_VALIDATION_MESSAGES.descriptionTooLong);

const nullableDescriptionSchema = descriptionSchema.nullable();

const prioritySchema = z.enum(
  [TICKET_PRIORITY.LOW, TICKET_PRIORITY.MEDIUM, TICKET_PRIORITY.HIGH],
  {
    errorMap: () => ({
      message: TICKET_VALIDATION_MESSAGES.invalidPriority,
    }),
  },
);

export const createTicketSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  priority: prioritySchema.default(TICKET_PRIORITY.MEDIUM),
  plannedStartDate: dateSchema.optional(),
  dueDate: dueDateSchema.optional(),
});

export const updateTicketSchema = z
  .object({
    title: titleSchema.optional(),
    description: nullableDescriptionSchema.optional(),
    priority: prioritySchema.optional(),
    plannedStartDate: nullableDateSchema.optional(),
    dueDate: nullableDueDateSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "수정할 필드를 입력해주세요",
  });

export const reorderTicketSchema = z.object({
  ticketId: z.number().int().positive(),
  status: z.enum(
    [TICKET_STATUS.BACKLOG, TICKET_STATUS.TODO, TICKET_STATUS.IN_PROGRESS],
    {
      errorMap: () => ({
        message: TICKET_VALIDATION_MESSAGES.invalidReorderStatus,
      }),
    },
  ),
  position: z.number().int(),
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;
export type UpdateTicketSchema = z.infer<typeof updateTicketSchema>;
export type ReorderTicketSchema = z.infer<typeof reorderTicketSchema>;
