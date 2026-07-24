import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  ASSET_STATUS_LABELS,
  AMORT_METHOD_LABELS,
  formatMoney,
  formatDate,
  type AmortMethod,
  type AssetStatus,
} from "@/lib/constants";
import { Badge, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { requireContext } from "@/lib/company";
import { SuccessToast } from "./SuccessToast";
import type { Prisma } from "@prisma/client";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { user, company } = await requireContext();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const categoryId = sp.category ?? "";
  const status = sp.status ?? "";

  const where: Prisma.AssetWhereInput = {
    organizationId: user.organizationId,
    companyId: company.id,
  };
  if (q) {
    where.OR = [
      { code: { contains: q } },
      { designation: { contains: q } },
      { serialNumber: { contains: q } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  const [assets, categories] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { category: true, location: true },
      orderBy: { code: "asc" },
    }),
    prisma.category.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <PageHeader
        title="Immobilisations"
        subtitle={`${company.name} · ${assets.length} bien(s)`}
        action={
          <ButtonLink href="/immobilisations/nouveau">
            + Nouvelle immobilisation
          </ButtonLink>
        }
      />

      <Card className="p-3 mb-4">
        <form className="flex flex-wrap gap-2 items-center" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher (code, désignation, n° série)…"
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <select
            name="category"
            defaultValue={categoryId}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">Tous statuts</option>
            <option value="IN_SERVICE">En service</option>
            <option value="DISPOSED">Sorti / cédé</option>
          </select>
          <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium">
            Filtrer
          </button>
        </form>
      </Card>

      <Card>
        {assets.length === 0 ? (
          <EmptyState
            title="Aucune immobilisation"
            hint="Créez votre première immobilisation pour générer son code-barres."
            action={
              <ButtonLink href="/immobilisations/nouveau">
                + Nouvelle immobilisation
              </ButtonLink>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Désignation</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium">Localisation</th>
                  <th className="px-4 py-3 font-medium">Acquisition</th>
                  <th className="px-4 py-3 font-medium text-right">Valeur</th>
                  <th className="px-4 py-3 font-medium">Amort.</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/immobilisations/${a.id}`}
                        className="font-mono text-slate-900 hover:underline"
                      >
                        {a.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{a.designation}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {a.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {a.location?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(a.acquisitionDate)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {formatMoney(a.acquisitionValue, company.currency)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {AMORT_METHOD_LABELS[a.method as AmortMethod]}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={a.status === "IN_SERVICE" ? "green" : "slate"}
                      >
                        {ASSET_STATUS_LABELS[a.status as AssetStatus]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}