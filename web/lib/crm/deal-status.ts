export const DEAL_STATUSES = [
  "Новый",
  "Квалификация",
  "Предложение отправлено",
  "Ждёт решения",
  "Закрыт",
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

/** Классы как в demo `dealStatus.js` (`.badge`). */
export function dealStatusBadgeClass(status: string): string {
  switch (status) {
    case "Новый":
      return "badge badge--blue";
    case "Квалификация":
      return "badge badge--amber";
    case "Предложение отправлено":
      return "badge badge--gold";
    case "Ждёт решения":
      return "badge badge--gray";
    case "Закрыт":
      return "badge badge--green";
    default:
      return "badge badge--gray";
  }
}
