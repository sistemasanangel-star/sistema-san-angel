import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const activo = searchParams.get("activo");

  const admissions = await prisma.patientAdmission.findMany({
    where: activo === null ? {} : { activo: activo === "1" },
    include: { visitadora: { select: { name: true } } },
    orderBy: { fechaIngreso: "desc" },
  });

  return NextResponse.json({ admissions });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { paciente, habitacion, fechaIngreso } = await req.json();
  if (!paciente || !habitacion) {
    return NextResponse.json(
      { error: "Paciente y habitación son obligatorios" },
      { status: 400 }
    );
  }

  const admission = await prisma.patientAdmission.create({
    data: {
      paciente,
      habitacion,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
      visitadoraId: user.id,
    },
  });

  return NextResponse.json({ admission }, { status: 201 });
}
