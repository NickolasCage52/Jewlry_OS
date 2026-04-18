import type { RoleCode } from "@/lib/types/session";

export type ChannelId =
  | "avito"
  | "ozon"
  | "wildberries"
  | "website"
  | "future_stub";

export type ChannelType = "classified" | "marketplace" | "owned" | "other";

export type ExternalChannel = {
  id: ChannelId;
  label: string;
  type: ChannelType;
  status: "active" | "paused" | "planned";
  readiness: "healthy" | "degraded" | "setup";
  publishingState: "partial" | "ready" | "blocked";
  syncState: "manual" | "stub_sync" | "error" | "ok_stub";
  lastUpdated: string;
  warnings: string[];
};

export type PublishWorkflowState =
  | "draft"
  | "ready"
  | "published"
  | "needs_update"
  | "paused"
  | "archived";

export type SkuChannelListing = {
  sku: string;
  channelId: ChannelId;
  enabled: boolean;
  hasContent: boolean;
  hasPrice: boolean;
  hasDescription: boolean;
  categoryOk: boolean;
  publishAllowed: boolean;
  workflow: PublishWorkflowState;
  published: boolean;
  lastPublishedAt?: string;
  staleReasons: string[];
  issues: string[];
};

export type ChannelActivityEvent = {
  id: string;
  at: string;
  channelId: ChannelId;
  sku?: string;
  action:
    | "published"
    | "updated"
    | "unpublished"
    | "error"
    | "needs_attention"
    | "checklist_ok";
  detail: string;
  actor: string;
};

export type SopSurface =
  | "client_card"
  | "product"
  | "procurement"
  | "publication"
  | "workflow";

export type SopDocument = {
  id: string;
  title: string;
  role: RoleCode | "all";
  processArea: string;
  steps: string[];
  version: string;
  status: "active" | "draft";
  updatedBy: string;
  updatedAt: string;
  owner: string;
  surfaces: SopSurface[];
};

export type OnboardingItem = {
  id: string;
  label: string;
  href?: string;
  sopId?: string;
};

export type OnboardingTrack = {
  role: RoleCode;
  title: string;
  items: OnboardingItem[];
};

export type UserOnboardingProgress = {
  userId: string;
  role: RoleCode;
  completedItemIds: string[];
  startedAt: string;
  updatedAt: string;
};

export type ClientLifecycleState =
  | "new"
  | "active"
  | "repeat"
  | "vip"
  | "dormant"
  | "reactivation_needed";

export type ClientLifecycleProfile = {
  clientKey: string;
  lifecycle: ClientLifecycleState;
  visitsApprox: number;
  ordersApprox: number;
  lifetimeValueRub: number;
  lastContactDaysAgo: number;
  segmentNote: string;
  careTriggers: string[];
};

export type WorkflowTask = {
  id: string;
  title: string;
  area: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  assigneeRole?: RoleCode;
  href?: string;
  reason: string;
  source: string;
};

export type ProductionStage =
  | "new_order"
  | "in_work"
  | "waiting_stone"
  | "assembly"
  | "finishing"
  | "ready"
  | "shipped";

export type ProductionOrderLite = {
  id: string;
  sku: string;
  productName: string;
  clientName: string;
  stage: ProductionStage;
  ownerName: string;
  responsible: "manager" | "workshop" | "warehouse" | "supply";
  dueAt: string;
  stuck: boolean;
  delayReason?: string;
};

export type IntegrationStub = {
  id: string;
  name: string;
  status: "stub" | "planned" | "degraded";
  lastCheck: string;
  detail: string;
};

export type ScaleState = {
  channels: ExternalChannel[];
  skuChannel: Record<string, Partial<Record<ChannelId, SkuChannelListing>>>;
  channelActivity: ChannelActivityEvent[];
  sops: SopDocument[];
  onboardingTracks: OnboardingTrack[];
  onboardingProgress: Record<string, UserOnboardingProgress>;
  /** userId → просмотренные SOP */
  sopReadByUser: Record<string, string[]>;
  clientLifecycle: Record<string, ClientLifecycleProfile>;
  workflowTasks: WorkflowTask[];
  productionOrders: ProductionOrderLite[];
  integrations: IntegrationStub[];
};
