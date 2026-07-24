import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_VERSION, GIT_SHA, BUILD_DATE } from "@/lib/version";

// Endpoint de supervision (uptime, version déployée, connexion base).
// Utile pour un healthcheck cloud (load balancer, monitoring).
export async function GET() {
  let db: "up" | "down" = "up";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "down";
  }

  return NextResponse.json(
    {
      status: db === "up" ? "ok" : "degraded",
      version: APP_VERSION,
      commit: GIT_SHA,
      buildDate: BUILD_DATE,
      database: db,
      time: new Date().toISOString(),
    },
    { status: db === "up" ? 200 : 503 },
  );
}
