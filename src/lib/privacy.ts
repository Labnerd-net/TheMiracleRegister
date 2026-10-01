// Applies a miracle's recipient_privacy setting to its recipient_name.
// confidential -> null, first_name_only -> first token, otherwise unchanged.
export function redactRecipient(
  name: string | null,
  privacy: string | null | undefined
): string | null {
  if (!name) return null;
  if (privacy === "confidential") return null;
  if (privacy === "first_name_only") return name.trim().split(/\s+/)[0] || null;
  return name;
}
