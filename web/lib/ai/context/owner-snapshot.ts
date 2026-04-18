import { funnelData, kpi, managers } from "@/lib/mock/dashboard";
import { getOpsStore } from "@/lib/ops/store";
import { buildOperationalAlerts } from "@/lib/services/ops-analytics";

export function buildOwnerDigestContext(): string {
  const s = getOpsStore();
  const alerts = buildOperationalAlerts();
  const payload = {
    kpi,
    funnel: funnelData,
    managers: managers.map((m) => ({
      name: m.name,
      deals: m.deals,
      revenue: m.revenue,
      conversion: m.conversion,
    })),
    alerts: alerts.map((a) => ({ title: a.title, detail: a.detail })),
    reservationsActive: s.reservations.filter((r) => r.status === "active").length,
    recentActivity: s.activity.slice(0, 8).map((e) => e.message),
    promotionsActive: s.promotions.filter((p) => p.status === "active").length,
  };
  return JSON.stringify(payload, null, 2);
}
