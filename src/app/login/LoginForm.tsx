"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          defaultValue="admin@gestimmo.local"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 disabled:opacity-50 transition"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
