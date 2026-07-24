import { prisma } from "@/lib/prisma";
import { AMORT_METHOD_LABELS, type AmortMethod } from "@/lib/constants";
import { Card, PageHeader } from "@/components/ui";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SuccessToast } from "./SuccessToast";
import {
  createCategory,
  deleteCategory,
  createLocation,
  deleteLocation,
} from "./actions";

const inputCls =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

export default async function ReferentielsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [categories, locations] = await Promise.all([
    prisma.category.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    }),
    prisma.location.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    }),
  ]);

  return (
    <>
      <SuccessToast />
      <PageHeader
        title="Référentiels"
        subtitle="Catégories d'immobilisations et localisations."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Catégories */}
        <Card className="p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Catégories</h2>
          <form
            action={createCategory}
            className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-slate-100"
          >
            <input name="code" placeholder="Code" required className={inputCls} />
            <input name="name" placeholder="Nom" required className={inputCls} />
            <input
              name="defaultDuration"
              type="number"
              min="0"
              placeholder="Durée (ans)"
              className={inputCls}
            />
            <select name="defaultMethod" defaultValue="LINEAR" className={inputCls}>
              <option value="LINEAR">Linéaire</option>
              <option value="DEGRESSIVE">Dégressif</option>
              <option value="NONE">Non amortissable</option>
            </select>
            <button className="col-span-2 rounded-lg bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800">
              Ajouter / mettre à jour
            </button>
          </form>
          <div className="divide-y divide-slate-50">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="font-mono text-slate-500 w-24 shrink-0">
                  {c.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 truncate">{c.name}</div>
                  <div className="text-xs text-slate-400">
                    {c.defaultDuration ? `${c.defaultDuration} ans · ` : ""}
                    {AMORT_METHOD_LABELS[c.defaultMethod as AmortMethod]} ·{" "}
                    {c._count.assets} bien(s)
                  </div>
                </div>
                {c._count.assets === 0 && (
                  <ConfirmSubmit
                    action={deleteCategory.bind(null, c.id)}
                    message={`Supprimer la catégorie ${c.name} ?`}
                    label="✕"
                    className="text-slate-400 hover:text-red-600 px-1"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Localisations */}
        <Card className="p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Localisations</h2>
          <form
            action={createLocation}
            className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-slate-100"
          >
            <input name="code" placeholder="Code" required className={inputCls} />
            <input name="name" placeholder="Nom" required className={inputCls} />
            <button className="col-span-2 rounded-lg bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800">
              Ajouter / mettre à jour
            </button>
          </form>
          <div className="divide-y divide-slate-50">
            {locations.map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="font-mono text-slate-500 w-24 shrink-0">
                  {l.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 truncate">{l.name}</div>
                  <div className="text-xs text-slate-400">
                    {l._count.assets} bien(s)
                  </div>
                </div>
                {l._count.assets === 0 && (
                  <ConfirmSubmit
                    action={deleteLocation.bind(null, l.id)}
                    message={`Supprimer la localisation ${l.name} ?`}
                    label="✕"
                    className="text-slate-400 hover:text-red-600 px-1"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}