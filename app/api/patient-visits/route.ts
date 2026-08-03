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
  const admissionId = searchParams.get("admissionId");

  const where: Record<string, unknown> = {};
  if (user.role !== "ADMIN") where.visitadoraId = user.id;
  else if (visitadoraId) where.visitadoraId = visitadoraId;
  if (admissionId) where.admissionId = admissionId;

  if (from || to) {
    where.fecha = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const visits = await prisma.patientVisit.findMany({
    where,
    include: {
      visitadora: { select: { name: true } },
      doctor: { select: { nombre: true } },
      admission: { select: { habitacion: true } },
      answers: { include: { question: true } },
    },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json({ visits });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { admissionId, doctorId, gpsLat, gpsLng, answers } = await req.json();
  if (!admissionId) {
    return NextResponse.json({ error: "Selecciona un paciente internado" }, { status: 400 });
  }

  const admission = await prisma.patientAdmission.findUnique({ where: { id: admissionId } });
  if (!admission) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  const visit = await prisma.patientVisit.create({
    data: {
      paciente: admission.paciente,
      admissionId,
      doctorId: doctorId || null,
      gpsLat: gpsLat ?? null,
      gpsLng: gpsLng ?? null,
      visitadoraId: user.id,
      answers: {
        create: (answers ?? []).map((a: { questionId: string; valor: string }) => ({
          questionId: a.questionId,
          valor: a.valor,
        })),
      },
    },
    include: { answers: true },
  });

  return NextResponse.json({ visit }, { status: 201 });
}
