import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-2xl py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white text-2xl font-bold mb-3">
            GI
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Créer un compte GestImmo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organisation, compte administrateur et sociétés.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
