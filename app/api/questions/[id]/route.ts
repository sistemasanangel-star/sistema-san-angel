import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede editar preguntas" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { texto, tipo, opciones, orden, active } = body;

  const question = await prisma.patientVisitQuestion.update({
    where: { id },
    data: {
      ...(texto !== undefined ? { texto } : {}),
      ...(tipo !== undefined ? { tipo } : {}),
      ...(opciones !== undefined ? { opciones: JSON.stringify(opciones) } : {}),
      ...(orden !== undefined ? { orden } : {}),
      ...(active !== undefined ? { active } : {}),
    },
  });

  return NextResponse.json({ question });
}
