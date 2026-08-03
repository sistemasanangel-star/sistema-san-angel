import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { action } = await req.json(); // "start" | "stop"

  await prisma.user.update({
    where: { id: user.id },
    data: {
      jornadaActiva: action === "start",
      ...(action === "stop" ? { ultimaUbicHora: null } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
