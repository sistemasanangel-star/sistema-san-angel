import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export async function GET() {
  const setting = await prisma.appSetting.findUnique({ where: { key: "whatsapp_number" } });
  return NextResponse.json({ whatsappNumber: setting?.value ?? WHATSAPP_NUMBER });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { whatsappNumber } = await req.json();
  if (!whatsappNumber || !/^\d{8,15}$/.test(whatsappNumber)) {
    return NextResponse.json(
      { error: "Ingresa un número válido (solo dígitos, con código de país)" },
      { status: 400 }
    );
  }

  await prisma.appSetting.upsert({
    where: { key: "whatsapp_number" },
    update: { value: whatsappNumber },
    create: { key: "whatsapp_number", value: whatsappNumber },
  });

  return NextResponse.json({ ok: true });
}
