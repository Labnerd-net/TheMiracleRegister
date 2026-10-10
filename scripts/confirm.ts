import { createInterface } from "node:readline/promises";

/** Asks a y/N question on the terminal. Callers must have checked `process.stdin.isTTY`. */
export async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} (y/N) `);
  rl.close();
  return answer.trim().toLowerCase() === "y";
}
