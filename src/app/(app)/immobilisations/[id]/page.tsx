import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildSchedule, netBookValue } from "@/lib/amortissement";
import {
  AMORT_METHOD_LABELS,
  ASSET_STATUS_LABELS,
  formatDate,
  formatMoney,
  type AmortMethod,
  type AssetStatus,
} from "@/lib/constants";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { Barcode } from "@/components/Barcode";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { getSession } from "@/lib/auth";
import { deleteAsset } from "../actions";
import { SuccessToast } from "../SuccessToast";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  const { id } = await params;
  const asset = await prisma.asset.findFirst({
    where: { id, organizationId: user?.organizationId },
    include: { category: true, location: true, company: true },
  });
  if (!asset) notFound();

  const currency = asset.company.currency;

  const amortInput = {
    acquisitionValue: asset.acquisitionValue,
    residualValue: asset.residualValue,
    duration: asset.duration,
    method: asset.method as AmortMethod,
    degressiveCoef: asset.degressiveCoef,
    acquisitionDate: asset.acquisitionDate,
  };
  const now = new Date();
  const schedule = buildSchedule(amortInput);
  const vnc = netBookValue(amortInput, now);
  const deleteThis = deleteAsset.bind(null, id);

  const infoRows: [string, string][] = [
    ["Société", asset.company.name],
    ["Catégorie", asset.category?.name ?? "—"],
    ["Localisation", asset.location?.name ?? "—"],
    ["Date d'acquisition", formatDate(asset.acquisitionDate)],
    ["Valeur d'acquisition", formatMoney(asset.acquisitionValue, currency)],
    ["Valeur résiduelle", formatMoney(asset.residualValue, currency)],
    ["Méthode", AMORT_METHOD_LABELS[asset.method as AmortMethod]],
    ["Durée", asset.duration ? `${asset.duration} ans` : "—"],
    ["N° de série", asset.serialNumber ?? "—"],
    ["Fournisseur", asset.supplier ?? "—"],
  ];

  return (
    <>
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <PageHeader
        title={asset.designation}
        subtitle={`${asset.code} · ${asset.company.name}`}
        action={
          <div className="flex gap-2">
            <ButtonLink
              href={`/etiquettes?ids=${asset.id}`}
              variant="secondary"
            >
              🏷 Étiquette
            </ButtonLink>
            <ButtonLink href={`/immobilisations/${asset.id}/modifier`}>
              Modifier
            </ButtonLink>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Informations</h2>
            <Badge tone={asset.status === "IN_SERVICE" ? "green" : "slate"}>
              {ASSET_STATUS_LABELS[asset.status as AssetStatus]}
            </Badge>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {infoRows.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-50 pb-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-900 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
          {asset.notes && (
            <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              {asset.notes}
            </p>
          )}
        </Card>

        <Card className="p-5 flex flex-col items-center justify-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Code-barres
          </span>
          <Barcode value={asset.code} height={60} />
          <div className="text-center">
            <div className="text-xs text-slate-500">
              Valeur nette comptable (aujourd&apos;hui)
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatMoney(vnc, currency)}
            </div>
          </div>
        </Card>
      </div>

      {schedule.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">
            Plan d&apos;amortissement —{" "}
            {AMORT_METHOD_LABELS[asset.method as AmortMethod]}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-3 py-2 font-medium">Année</th>
                  <th className="px-3 py-2 font-medium text-right">
                    VNC début
                  </th>
                  <th className="px-3 py-2 font-medium text-right">Dotation</th>
                  <th className="px-3 py-2 font-medium text-right">Cumul</th>
                  <th className="px-3 py-2 font-medium text-right">VNC fin</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((r) => (
                  <tr key={r.year} className="border-b border-slate-50">
                    <td className="px-3 py-2">{r.year}</td>
                    <td className="px-3 py-2 text-right">
                      {formatMoney(r.startValue, currency)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatMoney(r.annuity, currency)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {formatMoney(r.cumulative, currency)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatMoney(r.endValue, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Link
          href="/immobilisations"
          className="text-sm text-slate-500 hover:underline"
        >
          ← Retour à la liste
        </Link>
        <ConfirmSubmit
          action={deleteThis}
          message={`Supprimer définitivement ${asset.code} ? Cette action est irréversible.`}
          label="Supprimer"
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        />
      </div>
    </>
  );
}