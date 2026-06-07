export const TICKET_STATUS = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const;

export type TicketStatus =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export type TicketPriority =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export const COLUMN_ORDER: TicketStatus[] = [
  TICKET_STATUS.BACKLOG,
  TICKET_STATUS.TODO,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.DONE,
];

export const COLUMN_LABELS: Record<TicketStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "TODO",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
