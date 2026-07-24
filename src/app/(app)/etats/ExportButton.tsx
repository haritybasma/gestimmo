"use client";

type Row = {
  code: string;
  designation: string;
  category: string;
  location: string;
  acquisitionDate: string;
  method: string;
  acquisitionValue: number;
  linear: number;
  degressive: number;
  depreciationLinear: number;
  depreciationDegressive: number;
};

export function ExportButton({
  rows,
  asOf,
  currency,
}: {
  rows: Row[];
  asOf: string;
  currency: string;
}) {
  function exportCsv() {
    const headers = [
      "Code",
      "Désignation",
      "Catégorie",
      "Localisation",
      "Date acquisition",
      "Méthode",
      "Devise",
      "Valeur brute",
      "Amort. linéaire",
      "VNC linéaire",
      "Amort. dégressif",
      "VNC dégressif",
    ];
    const escape = (v: string | number) => {
      const s = String(v).replace(/"/g, '""');
      return /[";\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = rows.map((r) =>
      [
        r.code,
        r.designation,
        r.category,
        r.location,
        r.acquisitionDate,
        r.method,
        currency,
        r.acquisitionValue,
        r.depreciationLinear,
        r.linear,
        r.depreciationDegressive,
        r.degressive,
      ]
        .map(escape)
        .join(";"),
    );
    // BOM pour qu'Excel ouvre correctement l'UTF-8
    const csv = "﻿" + [headers.join(";"), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `etat-immobilisations-${asOf}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCsv}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-1.5 rounded-lg bg-white text-slate-700 border border-slate-300 px-3.5 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
    >
      ⬇ Exporter CSV
    </button>
  );
}
