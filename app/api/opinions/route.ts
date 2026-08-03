import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  const opinions = await prisma.opinion.findMany({
    where: tipo ? { tipo } : {},
    include: { doctor: { select: { nombre: true, perteneceA: true } } },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json({ opinions });
}

export async function POST(req: Request) {
  const { doctorId, habitacion, tipo, descripcion, fotoUrl } = await req.json();

  if (!tipo || !descripcion) {
    return NextResponse.json(
      { error: "Tipo de opinión y descripción son obligatorios" },
      { status: 400 }
    );
  }
  if (tipo !== "POSITIVA" && tipo !== "NEGATIVA") {
    return NextResponse.json({ error: "Tipo de opinión inválido" }, { status: 400 });
  }

  const opinion = await prisma.opinion.create({
    data: {
      doctorId: doctorId || null,
      habitacion: habitacion || null,
      tipo,
      descripcion,
      fotoUrl: fotoUrl || null,
    },
  });

  return NextResponse.json({ opinion }, { status: 201 });
}
