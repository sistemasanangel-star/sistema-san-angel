import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const rows = await prisma.doctor.findMany({
    where: { active: true },
    select: { perteneceA: true },
    distinct: ["perteneceA"],
    orderBy: { perteneceA: "asc" },
  });

  return NextResponse.json({ values: rows.map((r) => r.perteneceA) });
}
