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
  const { action } = body;

  const existing = await prisma.commission.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (action === "pagar") {
    if (existing.estado === "PAGADA") {
      return NextResponse.json({ error: "Esta comisión ya fue pagada" }, { status: 400 });
    }
    const { recibidoPor, firmaImagen, gpsLat, gpsLng, observaciones } = body;
    if (!recibidoPor || !firmaImagen || gpsLat == null || gpsLng == null) {
      return NextResponse.json(
        { error: "Recibido por, firma y GPS son obligatorios para pagar" },
        { status: 400 }
      );
    }
    const commission = await prisma.commission.update({
      where: { id },
      data: {
        estado: "PAGADA",
        fechaPago: new Date(),
        pagadoPorId: user.id,
        recibidoPor,
        firmaImagen,
        gpsLat,
        gpsLng,
        observaciones: observaciones || null,
      },
    });
    return NextResponse.json({ commission });
  }

  if (action === "editar") {
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (existing.estado === "PAGADA") {
      return NextResponse.json(
        { error: "No se puede editar una comisión ya pagada" },
        { status: 400 }
      );
    }
    const { doctorId, mes, montoCobrado, porcentaje } = body;
    const montoComision = (Number(montoCobrado) * Number(porcentaje)) / 100;
    const commission = await prisma.commission.update({
      where: { id },
      data: { doctorId, mes, montoCobrado: Number(montoCobrado), porcentaje: Number(porcentaje), montoComision },
    });
    return NextResponse.json({ commission });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.commission.findUnique({ where: { id } });
  if (existing?.estado === "PAGADA") {
    return NextResponse.json(
      { error: "No se puede eliminar una comisión ya pagada" },
      { status: 400 }
    );
  }

  await prisma.commission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
