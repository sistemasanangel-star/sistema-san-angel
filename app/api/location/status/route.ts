import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STALE_MINUTES = 10;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { jornadaActiva: true, ultimaUbicHora: true },
  });

  const isStale =
    record?.ultimaUbicHora &&
    Date.now() - new Date(record.ultimaUbicHora).getTime() > STALE_MINUTES * 60 * 1000;

  if (record?.jornadaActiva && isStale) {
    await prisma.user.update({ where: { id: user.id }, data: { jornadaActiva: false } });
    return NextResponse.json({ active: false, lastSent: record.ultimaUbicHora });
  }

  return NextResponse.json({
    active: record?.jornadaActiva ?? false,
    lastSent: record?.ultimaUbicHora ?? null,
  });
}
