export function parseEnum<T extends string>(
  val: string,
  allowed: readonly T[],
  fallback: T | null = null
): T | null {
  return (allowed as readonly string[]).includes(val) ? (val as T) : fallback;
}

export function formHelpers(form: FormData) {
  const get = (key: string) => form.get(key)?.toString().trim() ?? "";
  const getBool = (key: string) => form.get(key) === "true";
  const getArr = (key: string) =>
    get(key).split(",").map((s) => s.trim()).filter(Boolean);
  const getMulti = (key: string) => form.getAll(key).map((v) => v.toString());
  return { get, getBool, getArr, getMulti };
}
