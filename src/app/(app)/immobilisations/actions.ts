"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { requireContext } from "@/lib/company";
import { AMORT_METHODS, ASSET_STATUS } from "@/lib/constants";

/** Génère le prochain code séquentiel IMMO-000001, IMMO-000002, … (par organisation) */
export async function nextAssetCode(): Promise<string> {
  const user = await getSession();
  if (!user) return "IMMO-000001";
  const assets = await prisma.asset.findMany({
    where: { organizationId: user.organizationId, code: { startsWith: "IMMO-" } },
    select: { code: true },
  });
  let max = 0;
  for (const a of assets) {
    const n = parseInt(a.code.replace(/^IMMO-/, ""), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return `IMMO-${String(max + 1).padStart(6, "0")}`;
}

function parseAssetForm(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const designation = String(formData.get("designation") ?? "").trim();
  const method = String(formData.get("method") ?? "LINEAR");
  const status = String(formData.get("status") ?? "IN_SERVICE");

  const errors: string[] = [];
  if (!code) errors.push("Le code est obligatoire.");
  if (!designation) errors.push("La désignation est obligatoire.");
  if (!AMORT_METHODS.includes(method as never))
    errors.push("Méthode d'amortissement invalide.");
  if (!ASSET_STATUS.includes(status as never))
    errors.push("Statut invalide.");

  const acquisitionValue = Number(formData.get("acquisitionValue") ?? 0);
  const residualValue = Number(formData.get("residualValue") ?? 0);
  const duration = parseInt(String(formData.get("duration") ?? "0"), 10);
  const coefRaw = String(formData.get("degressiveCoef") ?? "").trim();
  const degressiveCoef = coefRaw ? Number(coefRaw) : null;

  if (!(acquisitionValue > 0))
    errors.push("La valeur d'acquisition doit être positive.");
  if (method !== "NONE" && !(duration > 0))
    errors.push("La durée d'amortissement doit être renseignée.");

  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const locationId = String(formData.get("locationId") ?? "") || null;
  const acqDateRaw = String(formData.get("acquisitionDate") ?? "");
  const acquisitionDate = acqDateRaw ? new Date(acqDateRaw) : new Date();

  return {
    errors,
    data: {
      code,
      designation,
      categoryId,
      locationId,
      acquisitionDate,
      acquisitionValue,
      residualValue: Number.isFinite(residualValue) ? residualValue : 0,
      duration: Number.isFinite(duration) ? duration : 0,
      method,
      degressiveCoef,
      serialNumber: String(formData.get("serialNumber") ?? "").trim() || null,
      supplier: String(formData.get("supplier") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      status,
    },
  };
}

export async function createAsset(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const { user, company } = await requireContext();

  const { errors, data } = parseAssetForm(formData);
  if (errors.length) return { error: errors.join(" ") };

  const existing = await prisma.asset.findFirst({
    where: { organizationId: user.organizationId, code: data.code },
  });
  if (existing) return { error: `Le code ${data.code} existe déjà.` };

  // L'immobilisation est créée dans la société active.
  await prisma.asset.create({
    data: { ...data, organizationId: user.organizationId, companyId: company.id },
  });
  revalidatePath("/immobilisations");
  redirect("/immobilisations?success=created");
}

export async function updateAsset(
  id: string,
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getSession();
  if (!user) redirect("/login");

  // sécurité : l'immobilisation doit appartenir à l'organisation
  const current = await prisma.asset.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!current) redirect("/immobilisations");

  const { errors, data } = parseAssetForm(formData);
  if (errors.length) return { error: errors.join(" ") };

  const dup = await prisma.asset.findFirst({
    where: { organizationId: user.organizationId, code: data.code, NOT: { id } },
  });
  if (dup) return { error: `Le code ${data.code} est déjà utilisé.` };

  await prisma.asset.update({
    where: { id },
    data: {
      ...data,
      disposedAt: data.status === "DISPOSED" ? new Date() : null,
    },
  });
  revalidatePath("/immobilisations");
  revalidatePath(`/immobilisations/${id}`);
  redirect(`/immobilisations/${id}?success=updated`);
}

export async function deleteAsset(id: string): Promise<void> {
  const user = await getSession();
  if (!user) redirect("/login");
  // sécurité : ne supprimer que dans l'organisation de l'utilisateur
  await prisma.asset.deleteMany({
    where: { id, organizationId: user.organizationId },
  });
  revalidatePath("/immobilisations");
  redirect("/immobilisations?success=deleted");
}