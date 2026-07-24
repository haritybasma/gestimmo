"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export function CameraScanner({
  onScan,
  onError,
}: {
  onScan: (code: string) => void;
  onError?: (msg: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let controls: { stop: () => void } | null = null;
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (cancelled || !result) return;
        const code = result.getText();
        const now = Date.now();
        // anti-rebond : on ignore le même code < 2s
        if (
          code === lastRef.current.code &&
          now - lastRef.current.at < 2000
        ) {
          return;
        }
        lastRef.current = { code, at: now };
        onScan(code);
      })
      .then((c) => {
        controls = c;
        if (!cancelled) setReady(true);
      })
      .catch((e) => {
        onError?.(
          "Impossible d'accéder à la caméra : " +
            (e instanceof Error ? e.message : String(e)),
        );
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full max-h-64 object-cover"
        muted
        playsInline
      />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-2/3 h-16 border-2 border-green-400/80 rounded-md" />
      </div>
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-white text-sm">
          Activation de la caméra…
        </div>
      )}
    </div>
  );
}
