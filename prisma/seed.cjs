const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const PREGUNTAS_BASE = [
  { texto: "¿Cómo se siente el paciente hoy?", tipo: "TEXTO", orden: 1 },
  { texto: "¿Está tomando el tratamiento indicado?", tipo: "SI_NO", orden: 2 },
  {
    texto: "Nivel de satisfacción con la atención recibida",
    tipo: "ESCALA",
    orden: 3,
  },
  {
    texto: "¿Presenta alguna molestia o síntoma nuevo?",
    tipo: "TEXTO",
    orden: 4,
  },
  { texto: "¿Requiere seguimiento adicional?", tipo: "SI_NO", orden: 5 },
];

async function main() {
  const adminPass = await bcrypt.hash("admin123", 10);
  const visitPass = await bcrypt.hash("visita123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPass,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { username: "visitadora1" },
    update: {},
    create: {
      username: "visitadora1",
      passwordHash: visitPass,
      name: "Visitadora Demo",
      role: "VISITADORA",
    },
  });

  for (const p of PREGUNTAS_BASE) {
    const existing = await prisma.patientVisitQuestion.findFirst({
      where: { texto: p.texto },
    });
    if (!existing) {
      await prisma.patientVisitQuestion.create({ data: p });
    }
  }

  console.log("Seed completado.");
  console.log("Usuarios: admin/admin123  |  visitadora1/visita123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
