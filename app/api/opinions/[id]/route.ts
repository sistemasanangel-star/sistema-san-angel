import { NextResponse } from "next/server";
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
  const { atendido } = await req.json();

  const opinion = await prisma.opinion.update({
    where: { id },
    data: { atendido: Boolean(atendido) },
  });

  return NextResponse.json({ opinion });
}
