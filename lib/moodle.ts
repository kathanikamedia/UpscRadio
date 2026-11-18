export const moodleConfigured = Boolean(process.env.MOODLE_URL && process.env.MOODLE_TOKEN);
export async function moodle<T>(fn: string, values: Record<string, string | number> = {}): Promise<T> {
  if (!moodleConfigured) throw new Error("The learning platform connection is awaiting configuration.");
  const body = new URLSearchParams({ wstoken: process.env.MOODLE_TOKEN!, wsfunction: fn, moodlewsrestformat: "json" });
  for (const [key, value] of Object.entries(values)) body.set(key, String(value));
  const response = await fetch(new URL("/webservice/rest/server.php", process.env.MOODLE_URL), {
    method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("The learning platform is temporarily unavailable.");
  const result = await response.json();
  if (result?.exception || result?.errorcode) throw new Error("The learning platform could not complete this request.");
  return result as T;
}
export function moodleLink(path: string) {
  return new URL(path, process.env.MOODLE_URL!).href;
}
