import { z } from "zod";

export const SaintFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  canonization_stage: z.string().min(1, "Canonization stage is required"),
});

export const MiracleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  saint_ids: z.array(z.string().regex(/^\d+$/)).min(1, "At least one saint must be selected"),
});

export function formatZodErrors(result: z.SafeParseError<unknown>): string {
  return result.error.issues.map((i) => i.message).join(", ");
}
