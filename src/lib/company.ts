import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSession, type SessionUser } from "./auth";

const COMPANY_COOKIE = "gestimmo_company";

export type CompanyContext = {
  id: string;
  name: string;
  country: string;
  currency: string;
};

/** Sociétés de l'organisation de l'utilisateur courant. */
export async function listCompanies(organizationId: string) {
  return prisma.company.findMany({
    where: { organizationId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

/**
 * Société active pour l'utilisateur courant : issue du cookie si valide,
 * sinon la société par défaut de l'organisation. Renvoie null si aucune société.
 */
export async function getCurrentCompany(): Promise<CompanyContext | null> {
  const user = await getSession();
  if (!user) return null;

  const store = await cookies();
  const cookieId = store.get(COMPANY_COOKIE)?.value;

  const companies = await listCompanies(user.organizationId);
  if (companies.length === 0) return null;

  const chosen =
    (cookieId && companies.find((c) => c.id === cookieId)) ||
    companies.find((c) => c.isDefault) ||
    companies[0];

  return {
    id: chosen.id,
    name: chosen.name,
    country: chosen.country,
    currency: chosen.currency,
  };
}

/**
 * Contexte requis pour les écrans métier : utilisateur connecté + société
 * active. Redirige si l'un manque.
 */
export async function requireContext(): Promise<{
  user: SessionUser;
  company: CompanyContext;
}> {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getCurrentCompany();
  if (!company) redirect("/societes");
  return { user, company };
}

/** Définit la société active (utilisé par le sélecteur). */
export async function setCurrentCompany(companyId: string): Promise<void> {
  const user = await getSession();
  if (!user) return;
  // sécurité : la société doit appartenir à l'organisation de l'utilisateur
  const company = await prisma.company.findFirst({
    where: { id: companyId, organizationId: user.organizationId },
  });
  if (!company) return;

  const store = await cookies();
  store.set(COMPANY_COOKIE, companyId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
