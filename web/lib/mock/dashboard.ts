/** Данные дашборда — паритет с demo `src/data/metrics.js`. */

export const kpi = {
  revenue: { value: 3_840_000, change: 12, trend: "up" as const },
  leads: { value: 147, change: 8, trend: "up" as const },
  conversion: { value: 31, change: -2, trend: "down" as const },
  avgCheck: { value: 42_300, change: 5, trend: "up" as const },
};

export const revenueChart = {
  labels: ["Май", "Июн", "Июл", "Авг", "Сен", "Окт"],
  current: [2_800_000, 3_100_000, 2_900_000, 3_300_000, 3_200_000, 3_840_000],
};

export const funnelData = [
  { stage: "Новые лиды", count: 147 },
  { stage: "Квалификация", count: 98 },
  { stage: "Предложение", count: 67 },
  { stage: "Ждут решения", count: 45 },
  { stage: "Закрыты", count: 31 },
];

export const managers = [
  { name: "А. Смирнова", deals: 14, revenue: 620_000, conversion: 38 },
  { name: "М. Петрова", deals: 11, revenue: 498_000, conversion: 32 },
  { name: "Д. Козлов", deals: 9, revenue: 401_000, conversion: 29 },
  { name: "К. Орлова", deals: 7, revenue: 318_000, conversion: 24 },
  { name: "С. Волков", deals: 5, revenue: 241_000, conversion: 19 },
];

export const sources = [
  { label: "Яндекс.Директ", value: 34 },
  { label: "Инстаграм", value: 28 },
  { label: "Авито", value: 19 },
  { label: "Сарафан", value: 12 },
  { label: "Прочее", value: 7 },
];

export const feedEvents = [
  {
    text: "А. Смирнова закрыла сделку с Мария С. на 52 000 \u20BD",
    time: "2 мин назад",
    type: "deal",
  },
  {
    text: "Новый лид: Игорь В. через Яндекс.Директ",
    time: "8 мин назад",
    type: "lead",
  },
  {
    text: "М. Петрова зарезервировала Браслет Бриллиант",
    time: "15 мин назад",
    type: "reserve",
  },
  {
    text: "Поступил новый товар: Серьги Изумруд Классик (12 шт.)",
    time: "1 час назад",
    type: "stock",
  },
  {
    text: "Д. Козлов отправил КП Ольге С.",
    time: "2 часа назад",
    type: "message",
  },
  {
    text: "Конверсия сегодня: 34% (+3% vs вчера)",
    time: "3 часа назад",
    type: "metric",
  },
];

export const aiSummaryText = `Выручка на 12% выше плана — тренд держится 3 месяца подряд.
Конверсия упала на 2%: у Д. Козлова 3 зависших сделки старше 7 дней — рекомендую ревью.
Остаток «Кольцо Сапфир Люкс» — 2 шт., при текущем темпе продаж закончится через 6 дней.
Лучший канал этого месяца: Авито (+34% vs прошлый мес.) — рекомендую увеличить бюджет.`;

export const criticalAlerts = [
  "Просрочен повторный контакт: Кристина Лебедева (ERR-4421) — 2 дня без связи.",
  "Производство PO-2026-029: готово к выдаче, клиент не отвечает на напоминания.",
  "Резерв BRC-5512 истекает 22.04 — подтвердить с Еленой Власовой.",
];

export const todayFocus = [
  "Свести статусы по VIP Людмиле Жуковой (сертификат + видео 4K).",
  "Проверить остатки RNG-2847 перед волной рекламы на Авито.",
  "Короткое ревью воронки: этап «Ждут решения» раздувается (+4 сделки за неделю).",
];

export function formatDashboardDate(d: Date) {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
