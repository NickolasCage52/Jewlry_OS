"use server";

import { roleHasPermission } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import {
  markOnboardingItem,
  markSopRead,
  setSkuChannelWorkflow,
} from "@/lib/scale/store";
import type { ChannelId, PublishWorkflowState } from "@/lib/scale/types";
import { revalidatePath } from "next/cache";

export async function setPublicationWorkflow(
  sku: string,
  channelId: ChannelId,
  workflow: PublishWorkflowState,
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (!roleHasPermission(session.role, "channel:manage")) {
    throw new Error("Forbidden");
  }
  setSkuChannelWorkflow(sku, channelId, workflow, session.name);
  const pubPath = `/app/publications/${encodeURIComponent(`${sku}|${channelId}`)}`;
  revalidatePath("/app/publications");
  revalidatePath(pubPath);
  revalidatePath("/app/channels");
  revalidatePath(`/app/channels/${channelId}`);
}

export async function toggleOnboardingItem(
  itemId: string,
  completed: boolean,
  trackRole: import("@/lib/types/session").RoleCode,
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (!roleHasPermission(session.role, "onboarding:access")) {
    throw new Error("Forbidden");
  }
  if (session.role !== trackRole) {
    throw new Error("Forbidden");
  }
  markOnboardingItem(session.id, trackRole, itemId, completed);
  revalidatePath("/app/onboarding");
  revalidatePath(`/app/onboarding/${trackRole}`);
}

export async function markSopViewed(sopId: string, read: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (!roleHasPermission(session.role, "sop:view")) {
    throw new Error("Forbidden");
  }
  markSopRead(session.id, sopId, read);
  revalidatePath("/app/sop");
  revalidatePath(`/app/sop/${sopId}`);
}
