"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { requireContext } from "@/lib/company";
import { SCAN_CONDITIONS } from "@/lib/constants";

/** Référence auto : INV-2026-001 (par organisation) */
async function nextCampaignRef(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.inventoryCampaign.count({
    where: { organizationId, reference: { startsWith: `INV-${year}-` } },
  });
  return `INV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createCampaign(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const { user, company } = await requireContext();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Le nom de la campagne est obligatoire." };
  const notes = String(formData.get("notes") ?? "").trim() || null;

  // périmètre : société active (défaut) ou toutes les sociétés du groupe
  const scope = String(formData.get("scope") ?? "company");
  let companyId: string | null = company.id;
  if (scope === "all") {
    companyId = null;
  } else if (scope !== "company") {
    // un id de société explicite : vérifier qu'elle appartient à l'organisation
    const c = await prisma.company.findFirst({
      where: { id: scope, organizationId: user.organizationId },
    });
    companyId = c ? c.id : company.id;
  }

  const reference = await nextCampaignRef(user.organizationId);
  const campaign = await prisma.inventoryCampaign.create({
    data: {
      name,
      notes,
      reference,
      organizationId: user.organizationId,
      companyId,
      createdById: user.id,
    },
  });
  revalidatePath("/inventaires");
  redirect(`/inventaires/${campaign.id}?success=created`);
}

export type ScanResult = {
  status: "matched" | "unknown" | "duplicate" | "othercompany" | "closed" | "error";
  message: string;
  assetCode?: string;
  designation?: string;
};

/** Enregistre un scan et renvoie le résultat pour retour visuel immédiat. */
export async function recordScan(
  campaignId: string,
  rawCode: string,
  foundLocationId: string | null,
  condition: string | null,
): Promise<ScanResult> {
  const user = await getSession();
  if (!user) return { status: "error", message: "Session expirée." };

  const code = rawCode.trim();
  if (!code) return { status: "error", message: "Code vide." };

  const campaign = await prisma.inventoryCampaign.findFirst({
    where: { id: campaignId, organizationId: user.organizationId },
  });
  if (!campaign) return { status: "error", message: "Campagne introuvable." };
  if (campaign.status === "CLOSED")
    return { status: "closed", message: "Inventaire clôturé." };

  const asset = await prisma.asset.findFirst({
    where: { organizationId: user.organizationId, code },
    include: { company: true },
  });

  // Déjà scanné dans cette campagne ?
  if (asset) {
    const existing = await prisma.inventoryScan.findFirst({
      where: { campaignId, assetId: asset.id },
    });
    if (existing) {
      return {
        status: "duplicate",
        message: `${code} déjà pointé.`,
        assetCode: code,
        designation: asset.designation,
      };
    }
  }

  const cond =
    condition && SCAN_CONDITIONS.includes(condition as never)
      ? condition
      : null;

  await prisma.inventoryScan.create({
    data: {
      campaignId,
      assetId: asset?.id ?? null,
      scannedCode: code,
      foundLocationId: foundLocationId || null,
      condition: cond,
      scannedById: user.id,
    },
  });

  revalidatePath(`/inventaires/${campaignId}`);

  if (!asset) {
    return {
      status: "unknown",
      message: `${code} — code inconnu (non répertorié).`,
      assetCode: code,
    };
  }

  // Le bien appartient à une autre société que le périmètre de la campagne
  if (campaign.companyId && asset.companyId !== campaign.companyId) {
    return {
      status: "othercompany",
      message: `${code} — appartient à ${asset.company.name} (autre société).`,
      assetCode: code,
      designation: asset.designation,
    };
  }

  return {
    status: "matched",
    message: `${code} pointé ✓`,
    assetCode: code,
    designation: asset.designation,
  };
}

export async function deleteScan(
  campaignId: string,
  scanId: string,
): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/login");
  // sécurité : le scan doit appartenir à une campagne de l'organisation
  await prisma.inventoryScan.deleteMany({
    where: {
      id: scanId,
      campaign: { id: campaignId, organizationId: user.organizationId },
    },
  });
  revalidatePath(`/inventaires/${campaignId}`);
}

export async function closeCampaign(id: string): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/login");
  await prisma.inventoryCampaign.updateMany({
    where: { id, organizationId: user.organizationId },
    data: { status: "CLOSED", closedAt: new Date() },
  });
  revalidatePath(`/inventaires/${id}`);
  revalidatePath("/inventaires");
}

export async function reopenCampaign(id: string): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/login");
  await prisma.inventoryCampaign.updateMany({
    where: { id, organizationId: user.organizationId },
    data: { status: "OPEN", closedAt: null },
  });
  revalidatePath(`/inventaires/${id}`);
  revalidatePath("/inventaires");
}