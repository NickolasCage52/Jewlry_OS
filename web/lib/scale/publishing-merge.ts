import { getOpsStore } from "@/lib/ops/store";
import type { SkuChannelListing } from "@/lib/scale/types";

function maxIso(a: string, b: string): string {
  return a > b ? a : b;
}

/** Сравнивает операционное ядро с датой публикации: при устаревании — needs_update. */
export function mergeListingWithOps(row: SkuChannelListing): SkuChannelListing {
  const ops = getOpsStore();
  const priceT = ops.prices[row.sku]?.lastUpdated ?? "";
  const invT = ops.inventory[row.sku]?.updatedAt ?? "";
  const opsT = maxIso(priceT, invT);
  const lastPub = row.lastPublishedAt ?? "";
  if (
    row.workflow === "published" &&
    lastPub &&
    opsT > lastPub
  ) {
    return {
      ...row,
      workflow: "needs_update",
      staleReasons: [
        ...new Set([
          ...row.staleReasons,
          "Операционные данные (цена / остаток / статус) новее версии на канале",
        ]),
      ],
    };
  }
  return row;
}

export function mergeAllListings(
  rows: SkuChannelListing[],
): SkuChannelListing[] {
  return rows.map(mergeListingWithOps);
}
