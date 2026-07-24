import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/constants";
import { getSession } from "@/lib/auth";
import { Badge, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";

export default async function CampaignsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const campaigns = await prisma.inventoryCampaign.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { startDate: "desc" },
    include: { _count: { select: { scans: true } }, company: true },
  });

  return (
    <>
      <PageHeader
        title="Inventaires"
        subtitle={`${campaigns.length} campagne(s)`}
        action={
          <ButtonLink href="/inventaires/nouveau">
            + Nouvel inventaire
          </ButtonLink>
        }
      />

      <Card>
        {campaigns.length === 0 ? (
          <EmptyState
            title="Aucune campagne d'inventaire"
            hint="Lancez un inventaire pour scanner et pointer vos biens."
            action={
              <ButtonLink href="/inventaires/nouveau">
                + Nouvel inventaire
              </ButtonLink>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Référence</th>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Périmètre</th>
                  <th className="px-4 py-3 font-medium">Début</th>
                  <th className="px-4 py-3 font-medium text-right">Pointés</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventaires/${c.id}`}
                        className="font-mono text-slate-900 hover:underline"
                      >
                        {c.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.company ? c.company.name : "Toutes sociétés"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(c.startDate)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {c._count.scans}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={c.status === "OPEN" ? "blue" : "slate"}>
                        {c.status === "OPEN" ? "En cours" : "Clôturé"}
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
