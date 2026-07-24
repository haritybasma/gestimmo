import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white text-2xl font-bold mb-3">
            GI
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GestImmo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion des immobilisations
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <LoginForm />
          <p className="text-center text-sm text-slate-500 mt-4">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="text-slate-900 font-medium hover:underline"
            >
              Créer une organisation
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          Compte de démonstration : admin@gestimmo.local / admin123
        </p>
      </div>
    </main>
  );
}
