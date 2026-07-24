import { prisma } from "@/lib/prisma";
import { valuationBothMethods } from "@/lib/amortissement";
import {
  AMORT_METHOD_LABELS,
  formatDate,
  formatMoney,
  type AmortMethod,
} from "@/lib/constants";
import { Card, PageHeader } from "@/components/ui";
import { requireContext } from "@/lib/company";
import { ExportButton } from "./ExportButton";
import type { Prisma } from "@prisma/client";

export default async function EtatsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; category?: string }>;
}) {
  const { user, company } = await requireContext();
  const currency = company.currency;
  const sp = await searchParams;
  const asOf = sp.date ? new Date(sp.date) : new Date();
  const dateStr = (sp.date ?? new Date().toISOString().slice(0, 10)).slice(0, 10);
  const categoryId = sp.category ?? "";

  const where: Prisma.AssetWhereInput = {
    organizationId: user.organizationId,
    companyId: company.id,
    status: "IN_SERVICE",
  };
  if (categoryId) where.categoryId = categoryId;

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

  const rows = assets.map((a) => {
    const v = valuationBothMethods(
      {
        acquisitionValue: a.acquisitionValue,
        residualValue: a.residualValue,
        duration: a.duration,
        degressiveCoef: a.degressiveCoef,
        acquisitionDate: a.acquisitionDate,
      },
      asOf,
    );
    return {
      code: a.code,
      designation: a.designation,
      category: a.category?.name ?? "",
      location: a.location?.name ?? "",
      acquisitionDate: formatDate(a.acquisitionDate),
      method: AMORT_METHOD_LABELS[a.method as AmortMethod],
      acquisitionValue: a.acquisitionValue,
      ...v,
    };
  });

  const totals = rows.reduce(
    (t, r) => ({
      gross: t.gross + r.acquisitionValue,
      linear: t.linear + r.linear,
      degressive: t.degressive + r.degressive,
      depLinear: t.depLinear + r.depreciationLinear,
      depDeg: t.depDeg + r.depreciationDegressive,
    }),
    { gross: 0, linear: 0, degressive: 0, depLinear: 0, depDeg: 0 },
  );

  return (
    <>
      <PageHeader
        title="État valorisé des immobilisations"
        subtitle={`${company.name} · valeurs nettes comptables au ${formatDate(asOf)}`}
        action={<ExportButton rows={rows} asOf={dateStr} currency={currency} />}
      />

      <Card className="p-3 mb-4">
        <form className="flex flex-wrap gap-2 items-end" method="get">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Arrêté au
            </label>
            <input
              type="date"
              name="date"
              defaultValue={dateStr}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Catégorie
            </label>
            <select
              name="category"
              defaultValue={categoryId}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">Toutes</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium">
            Actualiser
          </button>
        </form>
      </Card>

      {/* Totaux */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500">Valeur brute totale</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatMoney(totals.gross, currency)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">VNC totale — linéaire</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatMoney(totals.linear, currency)}
          </div>
          <div className="text-xs text-slate-400">
            amort. {formatMoney(totals.depLinear, currency)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">VNC totale — dégressif</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatMoney(totals.degressive, currency)}
          </div>
          <div className="text-xs text-slate-400">
            amort. {formatMoney(totals.depDeg, currency)}
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="px-3 py-3 font-medium">Code</th>
                <th className="px-3 py-3 font-medium">Désignation</th>
                <th className="px-3 py-3 font-medium">Acq.</th>
                <th className="px-3 py-3 font-medium text-right">V. brute</th>
                <th className="px-3 py-3 font-medium text-right">
                  VNC linéaire
                </th>
                <th className="px-3 py-3 font-medium text-right">
                  VNC dégressif
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="border-b border-slate-50">
                  <td className="px-3 py-2 font-mono text-slate-900">
                    {r.code}
                  </td>
                  <td className="px-3 py-2 text-slate-900">
                    {r.designation}
                    <span className="text-xs text-slate-400 ml-1">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {r.acquisitionDate}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatMoney(r.acquisitionValue, currency)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatMoney(r.linear, currency)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatMoney(r.degressive, currency)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                    Aucune immobilisation en service.
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-semibold text-slate-900">
                  <td className="px-3 py-3" colSpan={3}>
                    Total ({rows.length})
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatMoney(totals.gross, currency)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatMoney(totals.linear, currency)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatMoney(totals.degressive, currency)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </>
  );
}
