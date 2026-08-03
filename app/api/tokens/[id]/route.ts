import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json(); // "approve" | "reject"

  const existing = await prisma.deleteToken.findUnique({ where: { id } });
  if (!existing || existing.status !== "PENDIENTE") {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
  }

  if (action === "approve") {
    const token = randomBytes(4).toString("hex").toUpperCase();
    const updated = await prisma.deleteToken.update({
      where: { id },
      data: { status: "APROBADO", token, resolvedAt: new Date() },
    });
    return NextResponse.json({ request: updated });
  }

  if (action === "reject") {
    const updated = await prisma.deleteToken.update({
      where: { id },
      data: { status: "RECHAZADO", resolvedAt: new Date() },
    });
    return NextResponse.json({ request: updated });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
