import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  SCAN_CONDITION_LABELS,
  type ScanCondition,
} from "@/lib/constants";
import { Badge, Card, PageHeader } from "@/components/ui";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScanConsole } from "./ScanConsole";
import { closeCampaign, reopenCampaign, deleteScan } from "../actions";
import { SuccessToast } from "../SuccessToast";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  const { id } = await params;

  const campaign = await prisma.inventoryCampaign.findFirst({
    where: { id, organizationId: user.organizationId },
    include: { company: true },
  });
  if (!campaign) notFound();

  // Périmètre : biens attendus = société de la campagne, ou toutes les sociétés
  const expectedWhere = {
    organizationId: user.organizationId,
    status: "IN_SERVICE",
    ...(campaign.companyId ? { companyId: campaign.companyId } : {}),
  };

  const [expected, scans, locations] = await Promise.all([
    prisma.asset.findMany({
      where: expectedWhere,
      include: { location: true, category: true },
      orderBy: { code: "asc" },
    }),
    prisma.inventoryScan.findMany({
      where: { campaignId: id },
      include: {
        asset: { include: { location: true, company: true } },
        foundLocation: true,
      },
      orderBy: { scannedAt: "desc" },
    }),
    prisma.location.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
    }),
  ]);

  const scannedAssetIds = new Set(
    scans.filter((s) => s.assetId).map((s) => s.assetId as string),
  );
  const expectedIds = new Set(expected.map((a) => a.id));

  const present = expected.filter((a) => scannedAssetIds.has(a.id));
  const missing = expected.filter((a) => !scannedAssetIds.has(a.id));
  const unknown = scans.filter((s) => !s.assetId);

  // Biens scannés appartenant à une autre société que le périmètre
  const otherCompany = scans.filter(
    (s) => s.asset && !expectedIds.has(s.asset.id),
  );

  // Écarts de localisation : bien pointé dans une localisation ≠ localisation fiche
  const mislocated = scans.filter(
    (s) =>
      s.asset &&
      expectedIds.has(s.asset.id) &&
      s.foundLocationId &&
      s.asset.locationId &&
      s.foundLocationId !== s.asset.locationId,
  );

  const isOpen = campaign.status === "OPEN";
  const boundClose = closeCampaign.bind(null, id);
  const boundReopen = reopenCampaign.bind(null, id);

  const coverage =
    expected.length > 0
      ? Math.round((present.length / expected.length) * 100)
      : 0;

  const scopeLabel = campaign.company ? campaign.company.name : "Toutes sociétés";

  const summary = [
    { label: "Attendus", value: expected.length, tone: "slate" as const },
    { label: "Pointés présents", value: present.length, tone: "green" as const },
    { label: "Manquants", value: missing.length, tone: "red" as const },
    { label: "Non répertoriés", value: unknown.length, tone: "amber" as const },
  ];

  return (
    <>
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <PageHeader
        title={campaign.name}
        subtitle={`${campaign.reference} · ${scopeLabel} · démarré le ${formatDate(campaign.startDate)}`}
        action={
          <div className="flex items-center gap-3">
            <Badge tone={isOpen ? "blue" : "slate"}>
              {isOpen ? "En cours" : "Clôturé"}
            </Badge>
            {isOpen ? (
              <ConfirmSubmit
                action={boundClose}
                message="Clôturer cet inventaire ? Vous pourrez le rouvrir si besoin."
                label="Clôturer"
                className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800"
              />
            ) : (
              <ConfirmSubmit
                action={boundReopen}
                message="Rouvrir cet inventaire ?"
                label="Rouvrir"
                className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-50"
              />
            )}
          </div>
        }
      />

      {/* Synthèse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summary.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {s.value}
            </div>
          </Card>
        ))}
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Avancement</span>
          <span>{coverage}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>

      {/* Console de scan */}
      {isOpen && (
        <div className="mb-8">
          <ScanConsole campaignId={id} locations={locations} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Derniers pointages */}
        <Card className="p-5">
          <h2 className="font-semibold text-slate-900 mb-3">
            Pointages ({scans.length})
          </h2>
          {scans.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">Aucun scan pour l&apos;instant.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {scans.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 py-2 text-sm"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      s.assetId ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-slate-900">
                      {s.scannedCode}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {s.asset?.designation ?? "Code non répertorié"}
                      {s.foundLocation ? ` · ${s.foundLocation.name}` : ""}
                      {s.condition
                        ? ` · ${SCAN_CONDITION_LABELS[s.condition as ScanCondition]}`
                        : ""}
                    </div>
                  </div>
                  {isOpen && (
                    <ConfirmSubmit
                      action={deleteScan.bind(null, id, s.id)}
                      message="Supprimer ce pointage ?"
                      label="✕"
                      className="text-slate-400 hover:text-red-600 px-1"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Écarts */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">
              Manquants ({missing.length})
            </h2>
            {missing.length === 0 ? (
              <p className="text-sm text-green-600 py-2">
                Tous les biens attendus ont été pointés ✓
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                {missing.map((a) => (
                  <Link
                    key={a.id}
                    href={`/immobilisations/${a.id}`}
                    className="flex justify-between py-2 text-sm hover:bg-slate-50 px-1 rounded"
                  >
                    <span className="font-mono text-slate-900">{a.code}</span>
                    <span className="text-slate-500 truncate ml-2">
                      {a.location?.name ?? "—"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {otherCompany.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3">
                Biens d&apos;une autre société ({otherCompany.length})
              </h2>
              <p className="text-xs text-slate-400 mb-2">
                Scannés dans le lieu mais hors du périmètre de cet inventaire.
              </p>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 text-sm">
                {otherCompany.map((s) => (
                  <div key={s.id} className="py-2">
                    <span className="font-mono text-slate-900">
                      {s.scannedCode}
                    </span>
                    <div className="text-xs text-slate-500">
                      {s.asset?.designation} · {s.asset?.company?.name}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {unknown.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3">
                Codes non répertoriés ({unknown.length})
              </h2>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
                {unknown.map((s) => (
                  <div key={s.id} className="py-2 font-mono text-sm text-slate-900">
                    {s.scannedCode}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {mislocated.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3">
                Écarts de localisation ({mislocated.length})
              </h2>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 text-sm">
                {mislocated.map((s) => (
                  <div key={s.id} className="py-2">
                    <span className="font-mono text-slate-900">
                      {s.scannedCode}
                    </span>
                    <div className="text-xs text-slate-500">
                      Fiche : {s.asset?.location?.name ?? "—"} → Trouvé :{" "}
                      {s.foundLocation?.name}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/inventaires"
          className="text-sm text-slate-500 hover:underline"
        >
          ← Retour aux inventaires
        </Link>
      </div>
    </>
  );
}