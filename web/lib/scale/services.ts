import { getAiRuntimeConfig, isAiFeatureEnabled } from "@/lib/ai/config";
import type { AiFeatureKey } from "@/lib/ai/types";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { getOpsStore } from "@/lib/ops/store";
import {
  decodePublicationId,
  encodePublicationId,
} from "@/lib/scale/publication-id";
import { mergeListingWithOps } from "@/lib/scale/publishing-merge";
import { getScaleStore } from "@/lib/scale/store";
import type {
  ChannelActivityEvent,
  ChannelId,
  ClientLifecycleProfile,
  ExternalChannel,
  ProductionOrderLite,
  SkuChannelListing,
  SopDocument,
  SopSurface,
  WorkflowTask,
} from "@/lib/scale/types";
import type { RoleCode } from "@/lib/types/session";

export const channelsService = {
  list(): ExternalChannel[] {
    return getScaleStore().channels;
  },
  get(id: ChannelId): ExternalChannel | undefined {
    return getScaleStore().channels.find((c) => c.id === id);
  },
  activityForChannel(channelId: ChannelId): ChannelActivityEvent[] {
    return getScaleStore().channelActivity.filter((a) => a.channelId === channelId);
  },
  allActivity(limit = 40): ChannelActivityEvent[] {
    return getScaleStore().channelActivity.slice(0, limit);
  },
  listingsForChannel(
    channelId: ChannelId,
  ): { sku: string; name: string; listing: SkuChannelListing }[] {
    const s = getScaleStore();
    const out: { sku: string; name: string; listing: SkuChannelListing }[] = [];
    for (const sku of Object.keys(s.skuChannel)) {
      const raw = s.skuChannel[sku]?.[channelId];
      if (!raw) continue;
      out.push({
        sku,
        name: CATALOG_BY_SKU[sku]?.name ?? sku,
        listing: mergeListingWithOps(raw),
      });
    }
    return out.sort((a, b) => a.sku.localeCompare(b.sku));
  },
  readinessSummary(channelId: ChannelId) {
    const rows = this.listingsForChannel(channelId);
    const publishable = rows.filter(
      (r) =>
        r.listing.publishAllowed &&
        r.listing.workflow !== "archived" &&
        r.listing.issues.length === 0,
    ).length;
    const blocked = rows.filter((r) => r.listing.issues.length > 0).length;
    const needsAttention = rows.filter(
      (r) =>
        r.listing.workflow === "needs_update" ||
        r.listing.staleReasons.length > 0,
    ).length;
    return { total: rows.length, publishable, blocked, needsAttention };
  },
};

export const publishingService = {
  encodeId: encodePublicationId,
  decodeId: decodePublicationId,
  listMatrix(): {
    id: string;
    sku: string;
    name: string;
    channelId: ChannelId;
    listing: SkuChannelListing;
  }[] {
    const s = getScaleStore();
    const out: {
      id: string;
      sku: string;
      name: string;
      channelId: ChannelId;
      listing: SkuChannelListing;
    }[] = [];
    for (const sku of Object.keys(s.skuChannel)) {
      const chans = s.skuChannel[sku];
      if (!chans) continue;
      for (const channelId of Object.keys(chans) as ChannelId[]) {
        const raw = chans[channelId];
        if (!raw) continue;
        out.push({
          id: encodePublicationId(sku, channelId),
          sku,
          name: CATALOG_BY_SKU[sku]?.name ?? sku,
          channelId,
          listing: mergeListingWithOps(raw),
        });
      }
    }
    return out.sort((a, b) => a.sku.localeCompare(b.sku));
  },
  getById(id: string) {
    const parsed = decodePublicationId(id);
    if (!parsed) return null;
    const raw =
      getScaleStore().skuChannel[parsed.sku]?.[parsed.channelId] ?? null;
    if (!raw) return null;
    return {
      ...parsed,
      name: CATALOG_BY_SKU[parsed.sku]?.name ?? parsed.sku,
      listing: mergeListingWithOps(raw),
      catalog: CATALOG_BY_SKU[parsed.sku] ?? null,
    };
  },
  publicationChecklist(listing: SkuChannelListing, statusLabel?: string) {
    return [
      { key: "content", label: "Контент (медиа)", ok: listing.hasContent },
      { key: "price", label: "Цена", ok: listing.hasPrice },
      {
        key: "status",
        label: "Статус товара корректен",
        ok: statusLabel ? statusLabel !== "Архив" : true,
      },
      { key: "description", label: "Описание", ok: listing.hasDescription },
      { key: "category", label: "Категория / таксономия", ok: listing.categoryOk },
      {
        key: "allowed",
        label: "Публикация разрешена правилами",
        ok: listing.publishAllowed,
      },
    ];
  },
};

export const sopService = {
  list(): SopDocument[] {
    return getScaleStore().sops;
  },
  get(id: string): SopDocument | undefined {
    return getScaleStore().sops.find((x) => x.id === id);
  },
  bySurface(surface: SopSurface): SopDocument[] {
    return getScaleStore().sops.filter((s) => s.surfaces.includes(surface));
  },
  isRead(userId: string, sopId: string): boolean {
    return getScaleStore().sopReadByUser[userId]?.includes(sopId) ?? false;
  },
};

export const onboardingService = {
  track(role: RoleCode) {
    return getScaleStore().onboardingTracks.find((t) => t.role === role);
  },
  allTracks() {
    return getScaleStore().onboardingTracks;
  },
  progress(userId: string, role: RoleCode) {
    const pk = `${userId}:${role}`;
    return getScaleStore().onboardingProgress[pk] ?? null;
  },
  progressStats(
    userId: string,
    role: RoleCode,
  ): {
    total: number;
    done: number;
    status: "pending" | "started" | "in_progress" | "completed";
    track: import("@/lib/scale/types").OnboardingTrack | undefined;
  } {
    const track = this.track(role);
    const prog = this.progress(userId, role);
    const total = track?.items.length ?? 0;
    const done = prog?.completedItemIds.length ?? 0;
    let status: "pending" | "started" | "in_progress" | "completed" = "pending";
    if (done === 0 && prog) status = "started";
    if (done > 0 && total > 0 && done < total) status = "in_progress";
    if (total > 0 && done >= total) status = "completed";
    return { total, done, status, track };
  },
};

export const lifecycleService = {
  all(): ClientLifecycleProfile[] {
    return Object.values(getScaleStore().clientLifecycle);
  },
  get(clientKey: string): ClientLifecycleProfile | undefined {
    return getScaleStore().clientLifecycle[clientKey];
  },
};

export const workflowService = {
  list(): WorkflowTask[] {
    return getScaleStore().workflowTasks;
  },
  forRole(role: RoleCode): WorkflowTask[] {
    return getScaleStore().workflowTasks.filter(
      (t) => !t.assigneeRole || t.assigneeRole === role,
    );
  },
};

export const operationsOrdersService = {
  list(): ProductionOrderLite[] {
    return getScaleStore().productionOrders;
  },
  stuck(): ProductionOrderLite[] {
    return getScaleStore().productionOrders.filter((o) => o.stuck);
  },
  byStage(stage: ProductionOrderLite["stage"]) {
    return getScaleStore().productionOrders.filter((o) => o.stage === stage);
  },
};

export type TeamMemberStub = {
  id: string;
  name: string;
  role: RoleCode;
  email: string;
  lastLoginDaysAgo: number;
  modules: string[];
};

const TEAM_STUB: TeamMemberStub[] = [
  {
    id: "u-owner",
    name: "Тигран",
    role: "OWNER",
    email: "owner@atelier.demo",
    lastLoginDaysAgo: 0,
    modules: ["all"],
  },
  {
    id: "u-mkt",
    name: "Полина Волкова",
    role: "MKT",
    email: "mkt@atelier.demo",
    lastLoginDaysAgo: 1,
    modules: ["content", "channels", "publications", "faq"],
  },
  {
    id: "u-sales",
    name: "Мария Петрова",
    role: "SALES",
    email: "sales@atelier.demo",
    lastLoginDaysAgo: 4,
    modules: ["sales", "clients", "reservations"],
  },
  {
    id: "u-stock",
    name: "Константин Орлов",
    role: "STOCK",
    email: "stock@atelier.demo",
    lastLoginDaysAgo: 14,
    modules: ["inventory", "operations"],
  },
  {
    id: "u-supply",
    name: "Марина Лебедева",
    role: "SUPPLY",
    email: "supply@atelier.demo",
    lastLoginDaysAgo: 2,
    modules: ["procurement", "stones"],
  },
  {
    id: "u-admin",
    name: "Сергей Админов",
    role: "ADMIN",
    email: "admin@atelier.demo",
    lastLoginDaysAgo: 30,
    modules: ["users", "roles", "system"],
  },
];

export const systemHealthService = {
  team(): TeamMemberStub[] {
    return TEAM_STUB;
  },
  integrations() {
    return getScaleStore().integrations;
  },
  channelsWarnings() {
    const ch = getScaleStore().channels;
    return ch.flatMap((c) =>
      c.warnings.map((w) => ({ channel: c.label, message: w })),
    );
  },
  publishingWarnings() {
    return publishingService
      .listMatrix()
      .filter(
        (r) =>
          r.listing.workflow === "needs_update" || r.listing.issues.length > 0,
      )
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        sku: r.sku,
        channel: r.channelId,
        workflow: r.listing.workflow,
        issues: r.listing.issues,
      }));
  },
  ai() {
    const cfg = getAiRuntimeConfig();
    const keys: AiFeatureKey[] = [
      "search",
      "copilot",
      "ownerDigest",
      "generate",
      "classify",
      "recommend",
    ];
    return {
      provider: cfg.provider,
      apiConfigured:
        cfg.provider === "mock" ||
        !!(cfg.openaiApiKey || cfg.anthropicApiKey),
      features: keys.map((k) => ({ key: k, enabled: isAiFeatureEnabled(k) })),
    };
  },
  recentOpsErrors(): string[] {
    const ops = getOpsStore();
    const msgs: string[] = [];
    for (const a of ops.activity.slice(0, 5)) {
      if (a.type === "price" || a.type === "stock") continue;
      msgs.push(a.message);
    }
    return msgs;
  },
};
