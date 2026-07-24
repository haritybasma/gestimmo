"use client";

import { useState } from "react";
import { changePasswordAction } from "./action";

export default function ProfilPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setMessage(null);
    const result = await changePasswordAction(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
    }
    setIsPending(false);
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Mon profil</h1>
      <p className="text-sm text-slate-500 mb-6">Modifier votre mot de passe.</p>

      <form action={handleSubmit} className="space-y-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mot de passe actuel
          </label>
          <input
            type="password"
            name="currentPassword"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            name="newPassword"
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {message && (
          <div
            className={`text-sm rounded-lg px-3 py-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-slate-900 text-white text-sm font-medium rounded-lg py-2.5 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </div>
  );
}