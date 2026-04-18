import type { ClientRecord } from "@/lib/types/crm";

export const MOCK_CLIENTS: ClientRecord[] = [
  {
    id: 1,
    name: "Мария Соколова",
    phone: "+7 (916) 234-56-78",
    email: "m.sokolova@mail.ru",
    status: "Ждёт решения",
    lastContact: "12 дней назад",
    lastAction: "Звонок по кольцу с сапфиром",
    deal: {
      product: "Кольцо Сапфир Люкс",
      sku: "RNG-2847",
      price: 52000,
      stock: "В наличии",
      color: "#3B6E9C",
    },
    nextAction: { type: "Позвонить", date: "Сегодня, 15:00" },
    history: [],
    products: [
      { name: "Кольцо Сапфир Люкс", sku: "RNG-2847", stock: "В наличии", color: "#3B6E9C" },
    ],
    notes: "VIP, просит видео в 4K",
  },
  {
    id: 2,
    name: "Александр Петров",
    phone: "+7 (903) 456-78-90",
    email: "a.petrov@gmail.com",
    status: "Новый",
    lastContact: "2 часа назад",
    lastAction: "Запрос с Авито",
    deal: {
      product: "Кулон Изумруд",
      sku: "PND-0391",
      price: 38000,
      stock: "В наличии",
      color: "#2D7A4A",
    },
    nextAction: { type: "Отправить фото", date: "Сегодня" },
    history: [],
    products: [{ name: "Кулон Изумруд", sku: "PND-0391", stock: "В наличии", color: "#2D7A4A" }],
  },
  {
    id: 3,
    name: "Елена Власова",
    phone: "+7 (925) 678-90-12",
    email: "e.vlasova@yandex.ru",
    status: "Предложение отправлено",
    lastContact: "3 дня назад",
    lastAction: "Отправлено КП",
    deal: {
      product: "Браслет Бриллиант",
      sku: "BRC-5512",
      price: 89000,
      stock: "Резерв",
      color: "#7A6A4A",
    },
    nextAction: { type: "Напомнить", date: "Завтра, 11:00" },
    history: [],
    products: [{ name: "Браслет Бриллиант", sku: "BRC-5512", stock: "Резерв", color: "#7A6A4A" }],
  },
];

export function clientKey(id: number) {
  return `c${id}`;
}
