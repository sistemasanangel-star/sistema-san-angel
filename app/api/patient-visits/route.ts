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

  const visits = await prisma.patientVisit.findMany({
    where,
    include: {
      visitadora: { select: { name: true } },
      doctor: { select: { nombre: true } },
      answers: { include: { question: true } },
    },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json({ visits });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { paciente, doctorId, gpsLat, gpsLng, answers } = await req.json();
  if (!paciente) {
    return NextResponse.json({ error: "El nombre del paciente es obligatorio" }, { status: 400 });
  }

  const visit = await prisma.patientVisit.create({
    data: {
      paciente,
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
