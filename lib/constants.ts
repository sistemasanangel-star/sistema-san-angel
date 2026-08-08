export const CATEGORIAS_LUGAR = [
  { value: "SANATORIO", label: "Sanatorio" },
  { value: "CLINICA_PRIVADA", label: "Clínica privada" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "CENTRO_SALUD", label: "Centro de salud (público)" },
  { value: "COMADRONA", label: "Comadrona" },
  { value: "FARMACIA", label: "Farmacia" },
  { value: "LABORATORIO", label: "Laboratorio clínico" },
  { value: "CONSULTORIO", label: "Consultorio particular" },
  { value: "OTRO", label: "Otro" },
] as const;

export function categoriaLabel(value: string) {
  return CATEGORIAS_LUGAR.find((c) => c.value === value)?.label ?? value;
}

const CATEGORIA_COLORS: Record<string, { bg: string; text: string }> = {
  SANATORIO: { bg: "#EAF1F8", text: "#2E6DA4" },
  HOSPITAL: { bg: "#EAF1F8", text: "#2E6DA4" },
  CLINICA_PRIVADA: { bg: "#F1EBFC", text: "#7C3AED" },
  CONSULTORIO: { bg: "#F1EBFC", text: "#7C3AED" },
  CENTRO_SALUD: { bg: "#E7F8F5", text: "#0E9488" },
  COMADRONA: { bg: "#FDECF3", text: "#DB2777" },
  FARMACIA: { bg: "#EAF9F0", text: "#279257" },
  LABORATORIO: { bg: "#FEF3E2", text: "#B45309" },
  OTRO: { bg: "#F1F2F4", text: "#52585F" },
};

export function categoriaColor(value: string) {
  return CATEGORIA_COLORS[value] ?? CATEGORIA_COLORS.OTRO;
}

export const QUESTION_TYPES = [
  { value: "TEXTO", label: "Texto libre" },
  { value: "SI_NO", label: "Sí / No" },
  { value: "OPCION_MULTIPLE", label: "Opción múltiple" },
  { value: "ESCALA", label: "Escala (1-5)" },
  { value: "NUMERO", label: "Número" },
] as const;

export function questionTypeLabel(value: string) {
  return QUESTION_TYPES.find((c) => c.value === value)?.label ?? value;
}

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50212345678";

export const TARGET_TYPE_LABEL: Record<string, string> = {
  DOCTOR: "Médico / lugar",
  PATIENT_VISIT: "Visita a paciente",
  DOCTOR_VISIT: "Visita a médico",
};
