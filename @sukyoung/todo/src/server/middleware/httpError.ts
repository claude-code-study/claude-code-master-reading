import type { ApiErrorResponse } from "@/shared/types";

type ErrorCode = ApiErrorResponse["error"]["code"];

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}
