import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STALE_MINUTES = 5;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000);

  const visitadoras = await prisma.user.findMany({
    where: {
      role: "VISITADORA",
      jornadaActiva: true,
      ultimaUbicHora: { gte: cutoff },
    },
    select: {
      id: true,
      name: true,
      ultimaUbicLat: true,
      ultimaUbicLng: true,
      ultimaUbicHora: true,
    },
  });

  return NextResponse.json({ visitadoras });
}
