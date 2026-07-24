"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AMORT_METHODS,
  AMORT_METHOD_LABELS,
  ASSET_STATUS,
  ASSET_STATUS_LABELS,
  type AmortMethod,
  type AssetStatus,
} from "@/lib/constants";

type Option = { id: string; name: string };

export type AssetFormValues = {
  code: string;
  designation: string;
  categoryId: string | null;
  locationId: string | null;
  acquisitionDate: string; // yyyy-mm-dd
  acquisitionValue: number | string;
  residualValue: number | string;
  duration: number | string;
  method: string;
  degressiveCoef: number | string | null;
  serialNumber: string | null;
  supplier: string | null;
  notes: string | null;
  status: string;
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

export function AssetForm({
  action,
  categories,
  locations,
  values,
  submitLabel,
}: {
  action: (
    prev: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string }>;
  categories: Option[];
  locations: Option[];
  values: AssetFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [method, setMethod] = useState<string>(values.method);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <section className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Code *</label>
          <input
            name="code"
            defaultValue={values.code}
            required
            className={`${inputCls} font-mono`}
          />
          <p className="text-xs text-slate-400 mt-1">
            Sera encodé dans le code-barres.
          </p>
        </div>
        <div>
          <label className={labelCls}>Désignation *</label>
          <input
            name="designation"
            defaultValue={values.designation}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Catégorie</label>
          <select
            name="categoryId"
            defaultValue={values.categoryId ?? ""}
            className={inputCls}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Localisation</label>
          <select
            name="locationId"
            defaultValue={values.locationId ?? ""}
            className={inputCls}
          >
            <option value="">—</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Date d&apos;acquisition *</label>
          <input
            type="date"
            name="acquisitionDate"
            defaultValue={values.acquisitionDate}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Valeur d&apos;acquisition *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="acquisitionValue"
            defaultValue={values.acquisitionValue}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Valeur résiduelle</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="residualValue"
            defaultValue={values.residualValue}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Méthode d&apos;amortissement</label>
          <select
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={inputCls}
          >
            {AMORT_METHODS.map((m) => (
              <option key={m} value={m}>
                {AMORT_METHOD_LABELS[m as AmortMethod]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Durée (années)</label>
          <input
            type="number"
            min="0"
            name="duration"
            defaultValue={values.duration}
            disabled={method === "NONE"}
            className={`${inputCls} disabled:bg-slate-100`}
          />
        </div>
        <div>
          <label className={labelCls}>Coefficient dégressif</label>
          <input
            type="number"
            step="0.1"
            min="0"
            name="degressiveCoef"
            defaultValue={values.degressiveCoef ?? ""}
            disabled={method !== "DEGRESSIVE"}
            placeholder="auto"
            className={`${inputCls} disabled:bg-slate-100`}
          />
          <p className="text-xs text-slate-400 mt-1">
            Vide = coefficient standard selon la durée.
          </p>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>N° de série</label>
          <input
            name="serialNumber"
            defaultValue={values.serialNumber ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Fournisseur</label>
          <input
            name="supplier"
            defaultValue={values.supplier ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <select
            name="status"
            defaultValue={values.status}
            className={inputCls}
          >
            {ASSET_STATUS.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABELS[s as AssetStatus]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelCls}>Notes</label>
          <textarea
            name="notes"
            defaultValue={values.notes ?? ""}
            rows={2}
            className={inputCls}
          />
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <Link
          href="/immobilisations"
          className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-5 py-2.5 hover:bg-slate-50"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
