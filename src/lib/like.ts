// Escapes LIKE/ILIKE metacharacters so user input matches literally (Postgres default escape is backslash).
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, "\\$&");
}

// Contains-match pattern for ILIKE
export function likeContains(s: string): string {
  return `%${escapeLike(s)}%`;
}
