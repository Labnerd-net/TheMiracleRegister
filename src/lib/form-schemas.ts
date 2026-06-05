import { z } from "zod";

export const SaintFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  canonization_stage: z.string().min(1, "Canonization stage is required"),
});

export const MiracleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  saint_id: z.string().regex(/^\d+$/, "A saint must be selected"),
});

export function formatZodErrors(result: z.SafeParseError<unknown>): string {
  return result.error.issues.map((i) => i.message).join(", ");
}
