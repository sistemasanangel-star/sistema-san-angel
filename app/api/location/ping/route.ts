import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { lat, lng } = await req.json();
  if (lat == null || lng == null) {
    return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { ultimaUbicLat: lat, ultimaUbicLng: lng, ultimaUbicHora: now, jornadaActiva: true },
    }),
    prisma.locationPing.create({
      data: { visitadoraId: user.id, lat, lng, timestamp: now },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
