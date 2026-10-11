import type { Context } from "hono";
import type { ApiEnv } from "./env";

type C = Context<ApiEnv>;

export const notFound = (c: C) =>
  c.json({ data: null, meta: null, error: "Not found" }, 404);

export const badRequest = (c: C, message: string) =>
  c.json({ data: null, meta: null, error: message }, 400);

// Zod validation failures use the response envelope. Pass as `defaultHook` to every OpenAPIHono router.
export const validationHook = (
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } },
  c: C,
) => {
  if (result.success) return;
  const message = (result.error?.issues ?? [])
    .map((i) => (i.path.length ? `${i.path.map(String).join(".")}: ${i.message}` : i.message))
    .join("; ");
  return badRequest(c, message || "Invalid request");
};
