import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const onlyActive = searchParams.get("active") === "1";

  const questions = await prisma.patientVisitQuestion.findMany({
    where: onlyActive ? { active: true } : {},
    orderBy: { orden: "asc" },
  });

  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede editar preguntas" }, { status: 403 });
  }

  const { texto, tipo, opciones, orden } = await req.json();
  if (!texto || !tipo) {
    return NextResponse.json({ error: "Texto y tipo son obligatorios" }, { status: 400 });
  }

  const question = await prisma.patientVisitQuestion.create({
    data: {
      texto,
      tipo,
      opciones: tipo === "OPCION_MULTIPLE" ? JSON.stringify(opciones ?? []) : null,
      orden: orden ?? 0,
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}
