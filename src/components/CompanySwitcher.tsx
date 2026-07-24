"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchCompanyAction } from "@/app/(app)/company-actions";

type Company = { id: string; name: string; currency: string };

export function CompanySwitcher({
  companies,
  currentId,
}: {
  companies: Company[];
  currentId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (companies.length === 0) return null;

  function onChange(id: string) {
    start(async () => {
      await switchCompanyAction(id);
      router.refresh();
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-400 hidden sm:inline">Société</span>
      <select
        value={currentId}
        disabled={pending || companies.length === 1}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-900 disabled:opacity-70"
      >
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.currency}
          </option>
        ))}
      </select>
    </label>
  );
}
