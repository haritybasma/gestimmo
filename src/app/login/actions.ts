"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authenticate, createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "Identifiants incorrects." };
  }

  await createSession(user);

  // société active par défaut
  const defaultCompany = await prisma.company.findFirst({
    where: { organizationId: user.organizationId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  if (defaultCompany) {
    const store = await cookies();
    store.set("gestimmo_company", defaultCompany.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  const store = await cookies();
  store.delete("gestimmo_company");
  redirect("/login");
}
