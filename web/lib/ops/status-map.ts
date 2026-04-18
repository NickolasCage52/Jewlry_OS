import type { InventorySystemStatus } from "@/lib/ops/types";

const LABEL_MAP: Record<string, InventorySystemStatus> = {
  "В продаже": "in_stock",
  "В наличии": "in_stock",
  Резерв: "reserved",
  "Под заказ": "made_to_order",
  Продано: "sold_archive",
  Каталог: "out",
};

export function statusFromCatalogLabel(label: string): InventorySystemStatus {
  return LABEL_MAP[label] ?? "in_stock";
}

export function statusLabelRu(s: InventorySystemStatus): string {
  const m: Record<InventorySystemStatus, string> = {
    in_stock: "В наличии",
    reserved: "Резерв",
    made_to_order: "Под заказ",
    out: "Нет",
    production: "В производстве",
    awaiting_stone: "Ожидает вставку",
    sold_archive: "Продан / архив",
  };
  return m[s];
}
