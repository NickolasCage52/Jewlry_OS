export function dealStatusBadgeClass(status) {
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

export const DEAL_STATUSES = ["Новый", "Квалификация", "Предложение отправлено", "Ждёт решения", "Закрыт"];
