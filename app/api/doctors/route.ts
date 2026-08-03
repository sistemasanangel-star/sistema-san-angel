import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const categoria = searchParams.get("categoria");

  const doctors = await prisma.doctor.findMany({
    where: {
      active: true,
      ...(categoria ? { categoria } : {}),
      ...(q
        ? {
            OR: [
              { nombre: { contains: q } },
              { perteneceA: { contains: q } },
              { especialidad: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({ doctors });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { nombre, especialidad, categoria, perteneceA, direccion, gpsLat, gpsLng, telefono, horarioAtencion, notas } = body;

  if (!nombre || !categoria || !perteneceA) {
    return NextResponse.json(
      { error: "Nombre, categoría y 'a qué pertenece' son obligatorios" },
      { status: 400 }
    );
  }
  if (gpsLat === undefined || gpsLng === undefined || gpsLat === null || gpsLng === null) {
    return NextResponse.json(
      { error: "La ubicación GPS es obligatoria" },
      { status: 400 }
    );
  }

  const doctor = await prisma.doctor.create({
    data: {
      nombre,
      especialidad: especialidad || null,
      categoria,
      perteneceA,
      direccion: direccion || null,
      gpsLat,
      gpsLng,
      telefono: telefono || null,
      horarioAtencion: horarioAtencion || null,
      notas: notas || null,
      createdById: user.id,
    },
  });

  return NextResponse.json({ doctor }, { status: 201 });
}
