"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCampaign } from "../actions";

export function CampaignForm({
  companies,
  currentCompanyId,
}: {
  companies: { id: string; name: string }[];
  currentCompanyId: string;
}) {
  const [state, formAction, pending] = useActionState(createCampaign, {});
  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div
          className="flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: "#fef2f2",
            borderColor: "#fecaca",
            color: "#991b1b",
          }}
          role="alert"
        >
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#dc2626" }}
          >
            !
          </span>
          {state.error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nom de la campagne *
        </label>
        <input
          name="name"
          required
          placeholder="Ex. Inventaire annuel 2026 — Siège"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Périmètre
        </label>
        <select name="scope" defaultValue={currentCompanyId} className={inputCls}>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="all">Toutes les sociétés du groupe</option>
        </select>
        <p className="text-xs text-slate-400 mt-1">
          Détermine les biens attendus. Un bien scanné hors périmètre est signalé.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea name="notes" rows={3} className={inputCls} />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Création…" : "Créer et démarrer"}
        </button>
        <Link
          href="/inventaires"
          className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-5 py-2.5 hover:bg-slate-50"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}