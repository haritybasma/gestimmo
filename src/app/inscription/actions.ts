"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { COUNTRY_MAP } from "@/lib/countries";

type CompanyInput = {
  name?: string;
  country?: string;
  currency?: string;
  legalId?: string;
};

export async function registerAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const orgName = String(formData.get("orgName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!orgName || !name || !email || !password) {
    return { error: "Tous les champs du compte sont obligatoires." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  let companies: CompanyInput[] = [];
  try {
    companies = JSON.parse(String(formData.get("companies") ?? "[]"));
  } catch {
    companies = [];
  }
  companies = companies.filter((c) => c.name && c.name.trim());
  if (companies.length === 0) {
    return { error: "Ajoutez au moins une société." };
  }
  for (const c of companies) {
    if (!c.country || !COUNTRY_MAP[c.country]) {
      return { error: `Pays invalide pour « ${c.name} ».` };
    }
    if (!c.currency) c.currency = COUNTRY_MAP[c.country].currency;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await hashPassword(password);

  const { user, defaultCompanyId } = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({ data: { name: orgName } });
    const createdUser = await tx.user.create({
      data: {
        organizationId: org.id,
        name,
        email,
        passwordHash,
        role: "ADMIN",
      },
    });
    let defId = "";
    for (let i = 0; i < companies.length; i++) {
      const c = companies[i];
      const created = await tx.company.create({
        data: {
          organizationId: org.id,
          name: c.name!.trim(),
          country: c.country!,
          currency: c.currency!,
          legalId: c.legalId?.trim() || null,
          isDefault: i === 0,
        },
      });
      if (i === 0) defId = created.id;
    }
    return { user: createdUser, defaultCompanyId: defId };
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: "ADMIN",
    organizationId: user.organizationId,
  });

  // société active par défaut
  const store = await cookies();
  store.set("gestimmo_company", defaultCompanyId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}
