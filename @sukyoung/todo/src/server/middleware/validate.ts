import type { z } from "zod";

export const parseJson = async <TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> => {
  const body = await request.json().catch(() => ({}));
  return schema.parse(body);
};
