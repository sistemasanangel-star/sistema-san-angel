import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const visitadoraId = searchParams.get("visitadoraId");

  const where: Record<string, unknown> = {};
  if (user.role !== "ADMIN") where.visitadoraId = user.id;
  else if (visitadoraId) where.visitadoraId = visitadoraId;

  if (from || to) {
    where.fecha = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const visits = await prisma.doctorVisit.findMany({
    where,
    include: {
      visitadora: { select: { name: true } },
      doctor: { select: { nombre: true, categoria: true } },
    },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json({ visits });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { doctorId, gpsLat, gpsLng, recibidoPor, firmaImagen, observaciones } =
    await req.json();

  if (!doctorId || gpsLat == null || gpsLng == null || !recibidoPor || !firmaImagen) {
    return NextResponse.json(
      { error: "Médico, GPS, recibido por y firma son obligatorios" },
      { status: 400 }
    );
  }

  const visit = await prisma.doctorVisit.create({
    data: {
      doctorId,
      visitadoraId: user.id,
      gpsLat,
      gpsLng,
      recibidoPor,
      firmaImagen,
      observaciones: observaciones || null,
    },
  });

  return NextResponse.json({ visit }, { status: 201 });
}
