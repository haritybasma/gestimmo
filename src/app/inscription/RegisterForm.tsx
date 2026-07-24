"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { COUNTRIES, COUNTRY_MAP, CURRENCIES } from "@/lib/countries";
import { registerAction } from "./actions";

type CompanyRow = {
  name: string;
  country: string;
  currency: string;
  legalId: string;
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

function newRow(): CompanyRow {
  return { name: "", country: "MA", currency: "MAD", legalId: "" };
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, {});
  const [companies, setCompanies] = useState<CompanyRow[]>([newRow()]);

  function update(i: number, patch: Partial<CompanyRow>) {
    setCompanies((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }

  function onCountryChange(i: number, country: string) {
    // auto-remplit la devise selon le pays
    update(i, { country, currency: COUNTRY_MAP[country]?.currency ?? "" });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="companies" value={JSON.stringify(companies)} />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      {/* Organisation + compte admin */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Votre compte
        </h2>
        <div>
          <label className={labelCls}>Nom de l&apos;organisation / du groupe *</label>
          <input name="orgName" required className={inputCls} placeholder="Ex. Groupe Atlas" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Votre nom *</label>
            <input name="name" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" name="email" required className={inputCls} autoComplete="username" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Mot de passe *</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className={inputCls}
            autoComplete="new-password"
          />
          <p className="text-xs text-slate-400 mt-1">6 caractères minimum.</p>
        </div>
      </section>

      {/* Sociétés */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Vos sociétés
          </h2>
          <button
            type="button"
            onClick={() => setCompanies((r) => [...r, newRow()])}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            + Ajouter une société
          </button>
        </div>

        {companies.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Société {i + 1}
                {i === 0 && " (société par défaut)"}
              </span>
              {companies.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setCompanies((r) => r.filter((_, idx) => idx !== i))
                  }
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Retirer
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nom de la société *</label>
                <input
                  value={c.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  required
                  className={inputCls}
                  placeholder="Ex. Atlas Distribution SARL"
                />
              </div>
              <div>
                <label className={labelCls}>Pays</label>
                <select
                  value={c.country}
                  onChange={(e) => onCountryChange(i, e.target.value)}
                  className={inputCls}
                >
                  {COUNTRIES.map((co) => (
                    <option key={co.code} value={co.code}>
                      {co.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Devise</label>
                <select
                  value={c.currency}
                  onChange={(e) => update(i, { currency: e.target.value })}
                  className={inputCls}
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>
                  Identifiant légal (ICE, IF, SIREN…)
                </label>
                <input
                  value={c.legalId}
                  onChange={(e) => update(i, { legalId: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Création du compte…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-slate-900 font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
