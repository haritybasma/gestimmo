import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCompany } from "@/lib/company";
import { countryName } from "@/lib/countries";
import { Badge, Card, PageHeader } from "@/components/ui";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { CompanyForm } from "./CompanyForm";
import { SuccessToast } from "./SuccessToast";
import {
  createCompany,
  setDefaultCompany,
  deleteCompany,
  activateCompany,
} from "./actions";

export default async function SocietesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [companies, current] = await Promise.all([
    prisma.company.findMany({
      where: { organizationId: user.organizationId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: { _count: { select: { assets: true } } },
    }),
    getCurrentCompany(),
  ]);

  return (
    <>
      <SuccessToast />
      <PageHeader
        title="Sociétés"
        subtitle="Les entités de votre organisation. Chaque immobilisation appartient à une société."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="px-4 py-3 font-medium">Société</th>
                    <th className="px-4 py-3 font-medium">Pays</th>
                    <th className="px-4 py-3 font-medium">Devise</th>
                    <th className="px-4 py-3 font-medium text-right">Biens</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {c.name}
                          </span>
                          {c.isDefault && <Badge tone="blue">défaut</Badge>}
                          {current?.id === c.id && (
                            <Badge tone="green">active</Badge>
                          )}
                        </div>
                        {c.legalId && (
                          <div className="text-xs text-slate-400">
                            {c.legalId}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {countryName(c.country)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.currency}</td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {c._count.assets}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          {current?.id !== c.id && (
                            <ConfirmSubmit
                              action={activateCompany.bind(null, c.id)}
                              message={`Activer la société ${c.name} ?`}
                              label="Activer"
                              className="text-slate-600 hover:text-slate-900"
                            />
                          )}
                          {!c.isDefault && (
                            <ConfirmSubmit
                              action={setDefaultCompany.bind(null, c.id)}
                              message={`Définir ${c.name} comme société par défaut ?`}
                              label="Par défaut"
                              className="text-slate-600 hover:text-slate-900"
                            />
                          )}
                          <Link
                            href={`/societes/${c.id}`}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            Modifier
                          </Link>
                          {c._count.assets === 0 && companies.length > 1 && (
                            <ConfirmSubmit
                              action={deleteCompany.bind(null, c.id)}
                              message={`Supprimer la société ${c.name} ?`}
                              label="Supprimer"
                              className="text-red-500 hover:text-red-700"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card className="p-5 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">
            Ajouter une société
          </h2>
          <CompanyForm
            action={createCompany}
            submitLabel="Ajouter"
            compact
          />
        </Card>
      </div>
    </>
  );
}