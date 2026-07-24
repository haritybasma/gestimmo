import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { netBookValue } from "@/lib/amortissement";
import { formatMoney } from "@/lib/constants";
import type { AmortMethod } from "@/lib/constants";
import { Card, PageHeader } from "@/components/ui";
import { requireContext } from "@/lib/company";

export default async function DashboardPage() {
  const { user, company } = await requireContext();
  const now = new Date();
  const scope = { organizationId: user.organizationId, companyId: company.id };
  const assets = await prisma.asset.findMany({
    where: { ...scope, status: "IN_SERVICE" },
  });

  const grossValue = assets.reduce((s, a) => s + a.acquisitionValue, 0);
  const netValue = assets.reduce(
    (s, a) =>
      s +
      netBookValue(
        {
          acquisitionValue: a.acquisitionValue,
          residualValue: a.residualValue,
          duration: a.duration,
          method: a.method as AmortMethod,
          degressiveCoef: a.degressiveCoef,
          acquisitionDate: a.acquisitionDate,
        },
        now,
      ),
    0,
  );

  const [assetCount, openCampaigns, categoryCount, locationCount] =
    await Promise.all([
      prisma.asset.count({ where: scope }),
      prisma.inventoryCampaign.count({
        where: {
          organizationId: user.organizationId,
          status: "OPEN",
          OR: [{ companyId: company.id }, { companyId: null }],
        },
      }),
      prisma.category.count({ where: { organizationId: user.organizationId } }),
      prisma.location.count({ where: { organizationId: user.organizationId } }),
    ]);

  const stats = [
    {
      label: "Immobilisations",
      value: assetCount.toString(),
      href: "/immobilisations",
    },
    {
      label: "Valeur brute",
      value: formatMoney(grossValue, company.currency),
      href: "/etats",
    },
    {
      label: "Valeur nette (auj.)",
      value: formatMoney(netValue, company.currency),
      href: "/etats",
    },
    {
      label: "Inventaires en cours",
      value: openCampaigns.toString(),
      href: "/inventaires",
    },
  ];

  const shortcuts = [
    {
      href: "/immobilisations/nouveau",
      title: "Nouvelle immobilisation",
      desc: "Enregistrer un bien et générer son code.",
    },
    {
      href: "/etiquettes",
      title: "Imprimer des étiquettes",
      desc: "Planche de codes-barres à coller sur les biens.",
    },
    {
      href: "/inventaires/nouveau",
      title: "Lancer un inventaire",
      desc: "Scanner les biens et détecter les écarts.",
    },
    {
      href: "/etats",
      title: "État valorisé",
      desc: "VNC linéaire & dégressif à une date donnée.",
    },
  ];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle={`${company.name} · ${categoryCount} catégories · ${locationCount} localisations`}
      />

      {/* 1. PASSAGE À 1 COLONNE EN TRÈS PETIT ÉCRAN (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="min-w-0">
            {/* 2. min-w-0 SUR LA CARD ET LE CONTENEUR */}
            <Card className="p-4 hover:border-slate-300 transition min-w-0 h-full flex flex-col justify-between">
              <div className="text-xs text-slate-500 font-medium truncate">
                {s.label}
              </div>
              {/* 3. ADAPTATION DU TEXTE (text-base sm:text-xl) ET AJOUT DE TRUNCATE */}
              <div 
                className="text-base sm:text-xl font-bold text-slate-900 mt-1 truncate" 
                title={s.value}
              >
                {s.value}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Actions rapides
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="p-5 hover:border-slate-300 transition h-full">
              <div className="font-semibold text-slate-900">{s.title}</div>
              <div className="text-sm text-slate-500 mt-1">{s.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}