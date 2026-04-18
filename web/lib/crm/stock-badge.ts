/** Эталон: demo `stockBadge.js` */

export function stockBadgeClass(stock: string): string {
  switch (stock) {
    case "В наличии":
      return "badge badge--stock-in";
    case "Резерв":
      return "badge badge--stock-reserve";
    case "Под заказ":
      return "badge badge--stock-order";
    case "Продан":
      return "badge badge--stock-sold";
    default:
      return "badge badge--gray";
  }
}
