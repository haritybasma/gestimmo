"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function createCategory(formData: FormData) {
  const user = await getSession();
  if (!user) return;

  const code = (formData.get("code") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const defaultDurationRaw = formData.get("defaultDuration") as string;
  const defaultMethod = (formData.get("defaultMethod") as string) || "LINEAR";

  if (!code || !name) return;

  const defaultDuration = defaultDurationRaw ? parseInt(defaultDurationRaw, 10) : null;

  await prisma.category.upsert({
    where: {
      organizationId_code: {
        organizationId: user.organizationId,
        code,
      },
    },
    update: {
      name,
      defaultDuration,
      defaultMethod: defaultMethod as "LINEAR" | "DEGRESSIVE" | "NONE",
    },
    create: {
      organizationId: user.organizationId,
      code,
      name,
      defaultDuration,
      defaultMethod: defaultMethod as "LINEAR" | "DEGRESSIVE" | "NONE",
    },
  });

  revalidatePath("/referentiels");
  redirect("/referentiels?success=cat_created");
}

export async function deleteCategory(id: string) {
  const user = await getSession();
  if (!user) return;

  await prisma.category.deleteMany({
    where: { id, organizationId: user.organizationId },
  });

  revalidatePath("/referentiels");
}

export async function createLocation(formData: FormData) {
  const user = await getSession();
  if (!user) return;

  const code = (formData.get("code") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();

  if (!code || !name) return;

  await prisma.location.upsert({
    where: {
      organizationId_code: {
        organizationId: user.organizationId,
        code,
      },
    },
    update: { name },
    create: {
      organizationId: user.organizationId,
      code,
      name,
    },
  });

  revalidatePath("/referentiels");
  redirect("/referentiels?success=loc_created");
}

export async function deleteLocation(id: string) {
  const user = await getSession();
  if (!user) return;

  await prisma.location.deleteMany({
    where: { id, organizationId: user.organizationId },
  });

  revalidatePath("/referentiels");
}