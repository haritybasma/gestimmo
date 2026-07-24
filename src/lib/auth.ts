import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "./constants";

const COOKIE_NAME = "gestimmo_session";

// Clé de signature des sessions. En production, une vraie valeur est exigée :
// on refuse de démarrer avec une clé absente, trop courte ou par défaut, afin
// d'éviter tout déploiement avec des sessions falsifiables.
const rawSecret = process.env.AUTH_SECRET ?? "";
const INSECURE_DEFAULTS = new Set([
  "",
  "dev-secret-change-me",
  "change-me-in-production",
  "dev-secret-change-me-in-production-please-0123456789",
]);

// La vérification ne s'applique qu'à l'exécution du serveur, pas pendant le
// build (où le secret de prod n'a pas à être présent).
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (process.env.NODE_ENV === "production" && !isBuildPhase) {
  if (INSECURE_DEFAULTS.has(rawSecret) || rawSecret.length < 32) {
    throw new Error(
      "AUTH_SECRET manquant ou trop faible : définissez une valeur aléatoire d'au moins 32 caractères en production.",
    );
  }
}

const secret = new TextEncoder().encode(rawSecret || "dev-secret-change-me");

// Cookie « Secure » (HTTPS uniquement) en production par défaut. Peut être
// désactivé (COOKIE_SECURE=false) pour un accès temporaire en HTTP par IP,
// sans domaine ni certificat.
const cookieSecure =
  process.env.NODE_ENV === "production" &&
  process.env.COOKIE_SECURE !== "false";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
      organizationId: payload.organizationId as string,
    };
  } catch {
    return null;
  }
}

/** À utiliser en tête des pages/actions protégées. Renvoie l'utilisateur ou null. */
export async function currentUser(): Promise<SessionUser | null> {
  return getSession();
}

/** Vérifie les identifiants et renvoie l'utilisateur de session (ou null). */
export async function authenticate(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    organizationId: user.organizationId,
  };
}
