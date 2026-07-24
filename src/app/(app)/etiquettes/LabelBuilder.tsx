"use client";

import { useMemo, useRef, useState } from "react";
import { Barcode } from "@/components/Barcode";
import { Card } from "@/components/ui";

type Item = {
  id: string;
  code: string;
  designation: string;
  category: string;
  location: string;
};

export function LabelBuilder({
  items,
  preselected,
}: {
  items: Item[];
  preselected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(preselected.length ? preselected : []),
  );
  const [columns, setColumns] = useState(3);
  const [showDesignation, setShowDesignation] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  const [filter, setFilter] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimer = useRef<number | null>(null);

  function notify(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.designation.toLowerCase().includes(q),
    );
  }, [items, filter]);

  const selectedItems = items.filter((i) => selected.has(i.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    if (filtered.length === 0) {
      notify("error", "Aucun élément à sélectionner.");
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((i) => next.add(i.id));
      return next;
    });
    notify("success", `${filtered.length} étiquette(s) ajoutée(s) à la sélection.`);
  }

  return (
    <>
      {/* Notification succès / échec */}
      {toast && (
        <div
          className="no-print fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2"
          style={{
            backgroundColor: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            borderColor: toast.type === "success" ? "#bbf7d0" : "#fecaca",
            color: toast.type === "success" ? "#166534" : "#991b1b",
          }}
          role="status"
        >
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              backgroundColor: toast.type === "success" ? "#16a34a" : "#dc2626",
            }}
          >
            {toast.type === "success" ? "✓" : "!"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Panneau de configuration — masqué à l'impression */}
      <div className="no-print grid lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrer…"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
            <button
              onClick={selectAllFiltered}
              className="text-sm rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50"
            >
              Tout cocher
            </button>
            <button
              onClick={() => {
                setSelected(new Set());
                notify("success", "Sélection vidée.");
              }}
              className="text-sm rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50"
            >
              Vider
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((i) => (
              <label
                key={i.id}
                className="flex items-center gap-3 py-2 px-1 cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(i.id)}
                  onChange={() => toggle(i.id)}
                  className="w-4 h-4"
                />
                <span className="font-mono text-sm text-slate-900">
                  {i.code}
                </span>
                <span className="text-sm text-slate-500 truncate">
                  {i.designation}
                </span>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">
                Aucun résultat.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Mise en page</h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-slate-600 mb-1">
                Colonnes par page : {columns}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDesignation}
                onChange={(e) => setShowDesignation(e.target.checked)}
              />
              Afficher la désignation
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLocation}
                onChange={(e) => setShowLocation(e.target.checked)}
              />
              Afficher la localisation
            </label>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-sm text-slate-500 mb-2">
              {selectedItems.length} étiquette(s) sélectionnée(s)
            </div>
            <button
              onClick={() => {
                try {
                  window.print();
                  notify("success", "Impression lancée.");
                } catch {
                  notify("error", "Échec de l'impression. Veuillez réessayer.");
                }
              }}
              disabled={selectedItems.length === 0}
              className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 disabled:opacity-40"
            >
              🖨 Imprimer la planche
            </button>
          </div>
        </Card>
      </div>

      {/* Aperçu + zone imprimable */}
      {selectedItems.length > 0 && (
        <div className="mt-6">
          <div className="no-print text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Aperçu
          </div>
          <div
            className="print-area grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {selectedItems.map((i) => (
              <div
                key={i.id}
                className="border border-slate-300 rounded-md p-2 flex flex-col items-center justify-center bg-white break-inside-avoid"
              >
                <Barcode value={i.code} height={40} width={1.6} fontSize={12} />
                {showDesignation && (
                  <div className="text-[10px] text-center text-slate-700 mt-1 leading-tight line-clamp-2">
                    {i.designation}
                  </div>
                )}
                {showLocation && i.location && (
                  <div className="text-[9px] text-center text-slate-400">
                    {i.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}