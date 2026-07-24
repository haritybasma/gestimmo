"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui";
import { SCAN_CONDITIONS, SCAN_CONDITION_LABELS, type ScanCondition } from "@/lib/constants";
import { recordScan, type ScanResult } from "../actions";

const CameraScanner = dynamic(
  () => import("./CameraScanner").then((m) => m.CameraScanner),
  { ssr: false },
);

type Option = { id: string; name: string };

const toneClass: Record<ScanResult["status"], string> = {
  matched: "bg-green-50 text-green-700 border-green-200",
  unknown: "bg-amber-50 text-amber-700 border-amber-200",
  duplicate: "bg-blue-50 text-blue-700 border-blue-200",
  othercompany: "bg-purple-50 text-purple-700 border-purple-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export function ScanConsole({
  campaignId,
  locations,
}: {
  campaignId: string;
  locations: Option[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [camera, setCamera] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [condition, setCondition] = useState("");
  const [last, setLast] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    start(async () => {
      const res = await recordScan(
        campaignId,
        trimmed,
        locationId || null,
        condition || null,
      );
      setLast(res);
      setHistory((h) => [res, ...h].slice(0, 8));
      router.refresh();
      // remet le focus sur le champ pour la douchette
      inputRef.current?.focus();
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputRef.current?.value ?? "";
      submit(val);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const inputCls =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-slate-900";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Scanner un bien</h2>
        <button
          onClick={() => setCamera((c) => !c)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
        >
          {camera ? "Fermer la caméra" : "📷 Scanner à la caméra"}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Localisation constatée
          </label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className={`${inputCls} w-full`}
          >
            <option value="">— (non précisée)</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">État</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className={`${inputCls} w-full`}
          >
            <option value="">— (non précisé)</option>
            {SCAN_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {SCAN_CONDITION_LABELS[c as ScanCondition]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <div className="w-full">
            <label className="block text-xs text-slate-500 mb-1">
              Code (douchette ou saisie)
            </label>
            <input
              ref={inputRef}
              autoFocus
              onKeyDown={onKeyDown}
              placeholder="Scannez ou tapez le code + Entrée"
              className={`${inputCls} w-full font-mono`}
            />
          </div>
        </div>
      </div>

      {camera && (
        <div className="mb-4">
          <CameraScanner
            onScan={(code) => submit(code)}
            onError={(msg) =>
              setLast({ status: "error", message: msg })
            }
          />
          <p className="text-xs text-slate-400 mt-1">
            Présentez le code-barres dans le cadre. Chaque lecture est pointée
            automatiquement.
          </p>
        </div>
      )}

      {last && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${toneClass[last.status]} ${
            pending ? "opacity-60" : ""
          }`}
        >
          {last.message}
        </div>
      )}

      {history.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {history.slice(1).map((h, i) => (
            <span
              key={i}
              className={`text-xs rounded px-2 py-0.5 border ${toneClass[h.status]}`}
            >
              {h.assetCode ?? h.message}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
