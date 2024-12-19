export function objToString(obj: Record<string, string | number | boolean>): string {
  return (
    Object.entries(obj)
      .map(([key, value]) => `${key}=${value}`)
      .join(';') + ';'
  );
}
