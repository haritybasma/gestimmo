"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  cat_created: "Catégorie enregistrée avec succès.",
  loc_created: "Localisation enregistrée avec succès.",
};

export function SuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("success");
  const [visible, setVisible] = useState(!!key);

  useEffect(() => {
    if (!key) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      router.replace(url.pathname + url.search, { scroll: false });
    }, 3000);
    return () => clearTimeout(t);
  }, [key, router]);

  if (!key || !visible || !MESSAGES[key]) return null;

  return (
    <div
      className="no-print fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg"
      style={{
        backgroundColor: "#f0fdf4",
        borderColor: "#bbf7d0",
        color: "#166534",
      }}
      role="status"
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: "#16a34a" }}
      >
        ✓
      </span>
      {MESSAGES[key]}
    </div>
  );
}