"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { COUNTRIES, COUNTRY_MAP, CURRENCIES } from "@/lib/countries";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

type Values = {
  name: string;
  country: string;
  currency: string;
  legalId: string;
};

export function CompanyForm({
  action,
  values,
  submitLabel,
  compact = false,
  onCancelHref,
}: {
  action: (
    prev: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string }>;
  values?: Partial<Values>;
  submitLabel: string;
  compact?: boolean;
  onCancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [country, setCountry] = useState(values?.country ?? "MA");
  const [currency, setCurrency] = useState(
    values?.currency ?? COUNTRY_MAP[values?.country ?? "MA"]?.currency ?? "MAD",
  );

  function onCountry(c: string) {
    setCountry(c);
    setCurrency(COUNTRY_MAP[c]?.currency ?? currency);
  }

  return (
    <form action={formAction} className="space-y-3">
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
      <div className={compact ? "" : "grid sm:grid-cols-2 gap-3"}>
        <div className={compact ? "mb-3" : "sm:col-span-2"}>
          <label className={labelCls}>Nom de la société *</label>
          <input
            name="name"
            defaultValue={values?.name ?? ""}
            required
            className={inputCls}
          />
        </div>
        <div className={compact ? "mb-3" : ""}>
          <label className={labelCls}>Pays</label>
          <select
            name="country"
            value={country}
            onChange={(e) => onCountry(e.target.value)}
            className={inputCls}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className={compact ? "mb-3" : ""}>
          <label className={labelCls}>Devise</label>
          <select
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={inputCls}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className={compact ? "mb-3" : "sm:col-span-2"}>
          <label className={labelCls}>Identifiant légal (ICE, IF, SIREN…)</label>
          <input
            name="legalId"
            defaultValue={values?.legalId ?? ""}
            className={inputCls}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "…" : submitLabel}
        </button>
        {onCancelHref && (
          <Link
            href={onCancelHref}
            className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-50"
          >
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}