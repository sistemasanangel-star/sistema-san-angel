import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { performDelete } from "@/lib/deleteTarget";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { requestId, token } = await req.json();
  if (!requestId || !token) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const existing = await prisma.deleteToken.findUnique({ where: { id: requestId } });
  if (!existing || existing.status !== "APROBADO") {
    return NextResponse.json({ error: "Solicitud no válida o no aprobada" }, { status: 400 });
  }

  if (existing.token !== token.trim().toUpperCase()) {
    return NextResponse.json({ error: "Token incorrecto" }, { status: 400 });
  }

  await performDelete(existing.targetType, existing.targetId);

  await prisma.deleteToken.update({
    where: { id: requestId },
    data: { status: "USADO", token: null, resolvedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
