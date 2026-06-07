import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorResponse } from "@/shared/types";
import { HttpError } from "@/server/middleware/httpError";

type ErrorCode = ApiErrorResponse["error"]["code"];

const errorResponse = (
  status: number,
  code: ErrorCode,
  message: string,
) => {
  return NextResponse.json<ApiErrorResponse>(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
};

export const handleRouteError = (error: unknown) => {
  if (error instanceof HttpError) {
    return errorResponse(error.status, error.code, error.message);
  }

  if (error instanceof ZodError) {
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      error.issues[0]?.message ?? "요청 데이터 검증에 실패했습니다",
    );
  }

  return errorResponse(500, "INTERNAL_ERROR", "서버 내부 오류가 발생했습니다");
};
