import type { Context } from "hono";
import type { ApiEnv } from "./env";

type C = Context<ApiEnv>;

export const notFound = (c: C) =>
  c.json({ data: null, meta: null, error: "Not found" }, 404);

export const invalid = (c: C, message: string) =>
  c.json({ data: null, meta: null, error: message }, 400);
