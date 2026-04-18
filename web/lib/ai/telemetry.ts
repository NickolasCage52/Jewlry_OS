/** Hook для будущих логов / метрик AI (Sentry, OpenTelemetry). */
export function logAiEvent(
  event: string,
  payload: Record<string, string | number | boolean | undefined>,
) {
  if (process.env.NODE_ENV === "development") {
    console.info("[ai]", event, payload);
  }
}
