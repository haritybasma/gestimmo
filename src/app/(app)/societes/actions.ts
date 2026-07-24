"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { setCurrentCompany } from "@/lib/company";

export async function createCompany(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const user = await getSession();
  if (!user) return { error: "Non autorisé" };

  const name = formData.get("name") as string;
  const country = formData.get("country") as string;
  const currency = formData.get("currency") as string;
  const legalId = formData.get("legalId") as string;

  if (!name || !name.trim()) {
    return { error: "Le nom de la société est obligatoire." };
  }

  try {
    await prisma.company.create({
      data: {
        name: name.trim(),
        country: country || "MA",
        currency: currency || "MAD",
        legalId: legalId?.trim() || null,
        organizationId: user.organizationId,
      },
    });
  } catch (e) {
    return { error: "Impossible de créer la société." };
  }

  revalidatePath("/societes");
  redirect("/societes?success=created");
}

export async function updateCompany(
  id: string,
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const user = await getSession();
  if (!user) return { error: "Non autorisé" };

  const name = formData.get("name") as string;
  const country = formData.get("country") as string;
  const currency = formData.get("currency") as string;
  const legalId = formData.get("legalId") as string;

  if (!name || !name.trim()) {
    return { error: "Le nom de la société est obligatoire." };
  }

  try {
    await prisma.company.update({
      where: { id, organizationId: user.organizationId },
      data: {
        name: name.trim(),
        country,
        currency,
        legalId: legalId?.trim() || null,
      },
    });
  } catch (e) {
    return { error: "Impossible de modifier la société." };
  }

  revalidatePath("/societes");
  redirect("/societes?success=updated");
}

export async function activateCompany(id: string) {
  const user = await getSession();
  if (!user) return;

  await setCurrentCompany(id);
  revalidatePath("/", "layout");
}

export async function setDefaultCompany(id: string) {
  const user = await getSession();
  if (!user) return;

  await prisma.$transaction([
    prisma.company.updateMany({
      where: { organizationId: user.organizationId },
      data: { isDefault: false },
    }),
    prisma.company.update({
      where: { id, organizationId: user.organizationId },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/societes");
}

export async function deleteCompany(id: string) {
  const user = await getSession();
  if (!user) return;

  await prisma.company.deleteMany({
    where: { id, organizationId: user.organizationId },
  });

  revalidatePath("/societes");
}