"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { CompanySwitcher } from "@/components/CompanySwitcher";
import { versionLabel, versionDetail } from "@/lib/version";

interface AppLayoutProps {
  children: React.ReactNode;
  user: { name?: string | null; organizationId: string };
  companies: any[];
  currentCompany: any;
}

export default function AppLayout({
  children,
  user,
  companies,
  currentCompany,
}: AppLayoutProps) {
  // true = Sidebar dépliée | false = Sidebar réduite (Seul le hamburger + icônes)
  const [isOpen, setIsOpen] = useState(true);

  const nav = [
    { href: "/", label: "Tableau de bord", icon: "▦" },
    { href: "/immobilisations", label: "Immobilisations", icon: "▤" },
    { href: "/etiquettes", label: "Étiquettes", icon: "▥" },
    { href: "/inventaires", label: "Inventaires", icon: "✓" },
    { href: "/etats", label: "États valorisés", icon: "∑" },
    { href: "/societes", label: "Sociétés", icon: "🏢" },
    { href: "/referentiels", label: "Référentiels", icon: "⚙" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-800 antialiased">
      
      {/* 1. SIDEBAR DESKTOP & ÉCRAN RÉDUIT */}
      <aside
        className={`
          no-print bg-slate-900 text-slate-200 hidden md:flex flex-col shrink-0
          sticky top-0 h-screen border-r border-slate-800
          transition-all duration-300 z-30
          ${isOpen ? "w-64" : "w-16"}
        `}
      >
        {/* EN-TÊTE SIDEBAR : LOGO + HAMBURGER ☰ (TOUJOURS VISIBLE) */}
        <div className="flex h-16 px-3.5 items-center justify-between border-b border-slate-800 shrink-0">
          
          {/* Logo GI + Titre (Visible seulement si la sidebar est ouverte) */}
          {isOpen && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-white text-slate-900 grid place-items-center font-bold text-sm shrink-0 shadow-sm">
                GI
              </div>
              <span className="font-semibold text-white whitespace-nowrap text-base">
                GestImmo
              </span>
            </div>
          )}

          {/* LE BOUTON HAMBURGER ☰ */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ${
              !isOpen ? "mx-auto" : ""
            }`}
            title={isOpen ? "Réduire le menu" : "Agrandir le menu"}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* NAVIGATION SIDEBAR */}
        <div className="flex flex-1 flex-col justify-between p-2 overflow-y-auto">
          <nav className="flex flex-col gap-1 w-full">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`
                  flex items-center gap-3 py-2.5 rounded-lg 
                  hover:bg-slate-800 text-slate-300 hover:text-white transition-colors
                  ${isOpen ? "px-3 justify-start" : "px-0 justify-center"}
                `}
                title={!isOpen ? n.label : undefined}
              >
                <span className="text-lg shrink-0 w-6 h-6 flex items-center justify-center">
                  {n.icon}
                </span>
                
                {isOpen && (
                  <span className="text-sm font-medium leading-none whitespace-nowrap truncate">
                    {n.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* FOOTER UTILISATEUR DESKTOP */}
          <div className="mt-auto pt-3 border-t border-slate-800 shrink-0">
            {isOpen ? (
              /* Mode Déplié : Nom + Profil cliquable */
              <div className="px-2">
                <Link
                  href="/profil"
                  className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-lg hover:bg-slate-800/80 transition-colors group"
                  title="Changer le mot de passe"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white grid place-items-center font-bold text-xs shrink-0 ring-2 ring-slate-800">
                    {user?.name?.[0]?.toUpperCase() ?? "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-xs font-semibold truncate group-hover:underline">
                      {user?.name}
                    </div>
                    <div className="text-slate-400 text-[10px] truncate flex items-center gap-1">
                      <span>Administrateur </span>
                      <span className="text-slate-500">• Profil</span>
                    </div>
                  </div>
                </Link>

                <form action={logoutAction} className="mt-2">
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-xs">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="truncate">Se déconnecter</span>
                  </button>
                </form>

                <div className="mt-2 text-[10px] text-slate-500 truncate" title={versionDetail()}>
                  GestImmo {versionLabel}
                </div>
              </div>
            ) : (
              /* Mode Replié : Icône Profil + Déconnexion */
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/profil"
                  className="w-8 h-8 rounded-full bg-slate-700 text-white grid place-items-center font-bold text-xs shrink-0 hover:ring-2 hover:ring-white transition-all"
                  title={`${user?.name ?? "Utilisateur"} - Modifier le profil`}
                >
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Se déconnecter">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. BARRE DES ICÔNES EN BAS (STYLE MOBILE CONSERVÉ + BOUTON PROFIL) */}
      <div className="no-print md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 z-30 flex items-center overflow-x-auto px-2 scrollbar-none">
        <div className="flex items-center justify-between gap-1 w-full min-w-max">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] px-1 py-1 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <span className="text-base shrink-0 w-5 h-5 flex items-center justify-center">
                {n.icon}
              </span>
              <span className="text-[10px] font-medium leading-tight text-center whitespace-nowrap">
                {n.label}
              </span>
            </Link>
          ))}

          {/* NOUTEAU : BOUTON PROFIL AJOUTÉ POUR MOBILE */}
          <Link
            href="/profil"
            className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] px-1 py-1 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <span className="text-base shrink-0 w-5 h-5 flex items-center justify-center font-bold">
              👤
            </span>
            <span className="text-[10px] font-medium leading-tight text-center whitespace-nowrap">
              Profil
            </span>
          </Link>

          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="flex flex-col items-center justify-center gap-0.5 min-w-[72px] px-1 py-1 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <span className="text-base shrink-0 w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              <span className="text-[10px] font-medium leading-tight text-center whitespace-nowrap">
                Se déconnecter
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. CONTENU PRINCIPAL */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <header className="no-print sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-3">
            <div>
              {currentCompany ? (
                <CompanySwitcher companies={companies} currentId={currentCompany.id} />
              ) : (
                <Link href="/societes" className="text-sm text-slate-900 font-medium hover:underline">
                  + Créer une première société
                </Link>
              )}
            </div>

            {currentCompany && (
              <span className="text-xs text-slate-400 shrink-0">
                Devise : {currentCompany.currency}
              </span>
            )}
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}