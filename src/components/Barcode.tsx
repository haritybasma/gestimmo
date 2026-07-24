"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export function Barcode({
  value,
  height = 50,
  width = 2,
  fontSize = 14,
  displayValue = true,
  className = "",
}: {
  value: string;
  height?: number;
  width?: number;
  fontSize?: number;
  displayValue?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        height,
        width,
        fontSize,
        displayValue,
        margin: 4,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch {
      // valeur non encodable : on ignore
    }
  }, [value, height, width, fontSize, displayValue]);

  return <svg ref={ref} className={className} />;
}
