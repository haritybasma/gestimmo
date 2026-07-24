"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${
        active
          ? "bg-white text-slate-900 font-medium"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span className="w-4 text-center opacity-70">{icon}</span>
      {label}
    </Link>
  );
}
