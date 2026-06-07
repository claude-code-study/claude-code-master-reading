import { z } from "zod";
import { TICKET_PRIORITY, TICKET_STATUS } from "@/shared/constants";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다");

const nullableDateSchema = dateSchema.nullable();

const titleSchema = z
  .string()
  .trim()
  .min(1, "제목을 입력해주세요")
  .max(200, "제목은 200자 이내로 입력해주세요");

const descriptionSchema = z
  .string()
  .max(1000, "설명은 1000자 이내로 입력해주세요")
  .nullable();

const prioritySchema = z.enum([
  TICKET_PRIORITY.LOW,
  TICKET_PRIORITY.MEDIUM,
  TICKET_PRIORITY.HIGH,
]);

export const createTicketSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  priority: prioritySchema.default(TICKET_PRIORITY.MEDIUM),
  plannedStartDate: nullableDateSchema.optional(),
  dueDate: nullableDateSchema.optional(),
});

export const updateTicketSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    priority: prioritySchema.optional(),
    plannedStartDate: nullableDateSchema.optional(),
    dueDate: nullableDateSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "수정할 필드를 입력해주세요",
  });

export const reorderTicketSchema = z.object({
  ticketId: z.number().int().positive(),
  status: z.enum([
    TICKET_STATUS.BACKLOG,
    TICKET_STATUS.TODO,
    TICKET_STATUS.IN_PROGRESS,
  ]),
  position: z.number().int(),
});

export type CreateTicketSchema = z.infer<typeof createTicketSchema>;
export type UpdateTicketSchema = z.infer<typeof updateTicketSchema>;
export type ReorderTicketSchema = z.infer<typeof reorderTicketSchema>;
