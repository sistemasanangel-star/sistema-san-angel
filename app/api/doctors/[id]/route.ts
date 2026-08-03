import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { nombre, especialidad, categoria, perteneceA, direccion, gpsLat, gpsLng, telefono, horarioAtencion, notas } = body;

  const doctor = await prisma.doctor.update({
    where: { id },
    data: {
      ...(nombre !== undefined ? { nombre } : {}),
      ...(especialidad !== undefined ? { especialidad } : {}),
      ...(categoria !== undefined ? { categoria } : {}),
      ...(perteneceA !== undefined ? { perteneceA } : {}),
      ...(direccion !== undefined ? { direccion } : {}),
      ...(gpsLat !== undefined ? { gpsLat } : {}),
      ...(gpsLng !== undefined ? { gpsLng } : {}),
      ...(telefono !== undefined ? { telefono } : {}),
      ...(horarioAtencion !== undefined ? { horarioAtencion } : {}),
      ...(notas !== undefined ? { notas } : {}),
    },
  });

  return NextResponse.json({ doctor });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede eliminar directamente. Solicita un token." },
      { status: 403 }
    );
  }

  const { id } = await params;
  await prisma.doctor.update({ where: { id }, data: { active: false } });

  return NextResponse.json({ ok: true });
}
