import type { SedeIntake } from "@/lib/types";

// Ingresos por carrera a la Sede Salto del CENUR Litoral Norte (Udelar), 2020 a 2026.
// Fuente: cuadro "CENUR LN – Sede Salto. Ingresos por carrera" que la sede mandó por
// mail el 04/11/2026 (Unidad de Comunicación, con el visto del director de la sede).
// Transcripto a mano del PDF; las filas suman los totales del cuadro en todos los años
// (lo controla tests/datos.test.ts). Una celda vacía en el cuadro queda como null.
// No es lo mismo que los ingresos del Anuario del MEC (carreras-mec.ts): la sede cuenta
// sus propias inscripciones y los números de un mismo año pueden no coincidir.

export const cenurSaltoFuente = {
  cita: "CENUR Litoral Norte, Sede Salto (Udelar): ingresos por carrera 2020-2026",
  sourceUrl: "https://www.litoralnorte.udelar.edu.uy/",
  retrievedAt: "2026-11-04",
  nota: "Cuadro enviado por la sede a realidad.uy el 04/11/2026. 2026: inscripciones hasta marzo.",
};

export const CENUR_SALTO_ANIOS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"] as const;

/** Totales que informa el cuadro, para controlar la transcripción. */
export const cenurSaltoTotales: Record<string, number> = {
  "2020": 907, "2021": 1394, "2022": 1176, "2023": 1346, "2024": 1277, "2025": 1443, "2026": 1190,
};

export const ingresosCenurSalto: SedeIntake[] = [
  { territoryId: "UY-SA", career: "Abogacía", ingresos: { "2020": 112, "2021": 135, "2022": 139, "2023": 143, "2024": 153, "2025": 162, "2026": 160 } },
  { territoryId: "UY-SA", career: "Agronomía", ingresos: { "2020": 66, "2021": 71, "2022": 62, "2023": 85, "2024": 72, "2025": 92, "2026": 78 } },
  { territoryId: "UY-SA", career: "Bioquímico clínico", ingresos: { "2020": 0, "2021": 28, "2022": 10, "2023": 9, "2024": null, "2025": 6, "2026": 3 } },
  { territoryId: "UY-SA", career: "Ciclo Biología Bioquímica", ingresos: { "2020": 6, "2021": 28, "2022": 30, "2023": 28, "2024": 36, "2025": 42, "2026": 53 } },
  { territoryId: "UY-SA", career: "Ciclo Inicial de Matemática", ingresos: { "2020": 9, "2021": 3, "2022": 3, "2023": 1, "2024": 6, "2025": 3, "2026": 0 } },
  { territoryId: "UY-SA", career: "CIO Área Social: Ciencias Económicas", ingresos: { "2020": 28, "2021": 45, "2022": 41, "2023": 44, "2024": 43, "2025": 48, "2026": 27 } },
  { territoryId: "UY-SA", career: "CIO Área Social: trayectoria Comunicación", ingresos: { "2020": 14, "2021": 23, "2022": 20, "2023": 18, "2024": 12, "2025": 20, "2026": 14 } },
  { territoryId: "UY-SA", career: "CIO Área Social: trayectoria Psicología", ingresos: { "2020": 163, "2021": 285, "2022": 220, "2023": 233, "2024": 201, "2025": 227, "2026": 179 } },
  { territoryId: "UY-SA", career: "CIO Área Social: trayectoria Turismo", ingresos: { "2020": 22, "2021": 0, "2022": 27, "2023": 0, "2024": 28, "2025": 0, "2026": 17 } },
  { territoryId: "UY-SA", career: "CIO Área Científico Tecnológica", ingresos: { "2020": 61, "2021": 74, "2022": 62, "2023": 151, "2024": 97, "2025": 90, "2026": 85 } },
  { territoryId: "UY-SA", career: "CIO trayectoria Ingeniería", ingresos: { "2020": null, "2021": null, "2022": null, "2023": null, "2024": null, "2025": null, "2026": 23 } },
  { territoryId: "UY-SA", career: "Facultad de Ciencias Sociales: ciclo inicial", ingresos: { "2020": 93, "2021": 126, "2022": 97, "2023": 84, "2024": 124, "2025": 146, "2026": 111 } },
  { territoryId: "UY-SA", career: "Ingeniería Biológica", ingresos: { "2020": 15, "2021": 15, "2022": 19, "2023": 12, "2024": 19, "2025": 19, "2026": 12 } },
  { territoryId: "UY-SA", career: "Ingeniería en Alimentos", ingresos: { "2020": 0, "2021": 0, "2022": 0, "2023": 3, "2024": 4, "2025": 2, "2026": 2 } },
  { territoryId: "UY-SA", career: "Ingeniería en Computación", ingresos: { "2020": 0, "2021": 0, "2022": 0, "2023": 59, "2024": 67, "2025": 78, "2026": 30 } },
  { territoryId: "UY-SA", career: "Licenciatura en Biotecnología", ingresos: { "2020": null, "2021": null, "2022": null, "2023": null, "2024": null, "2025": null, "2026": 6 } },
  { territoryId: "UY-SA", career: "Ingeniero Químico", ingresos: { "2020": 3, "2021": 2, "2022": 3, "2023": 4, "2024": null, "2025": 8, "2026": 3 } },
  { territoryId: "UY-SA", career: "Licenciatura en Diseño Integrado", ingresos: { "2020": 37, "2021": 35, "2022": 39, "2023": 24, "2024": 33, "2025": 30, "2026": 24 } },
  { territoryId: "UY-SA", career: "Licenciatura en Enfermería", ingresos: { "2020": 114, "2021": 174, "2022": 164, "2023": 163, "2024": 165, "2025": 152, "2026": 137 } },
  { territoryId: "UY-SA", career: "Licenciatura en Química", ingresos: { "2020": 0, "2021": 0, "2022": 2, "2023": 0, "2024": 1, "2025": 5, "2026": 2 } },
  { territoryId: "UY-SA", career: "Licenciatura en Recursos Hídricos", ingresos: { "2020": 19, "2021": 29, "2022": 21, "2023": 14, "2024": 14, "2025": 24, "2026": 10 } },
  { territoryId: "UY-SA", career: "Licenciatura en Turismo (Plan 2014)", ingresos: { "2020": 0, "2021": 58, "2022": 0, "2023": 47, "2024": null, "2025": 55, "2026": 0 } },
  { territoryId: "UY-SA", career: "Médico Veterinario", ingresos: { "2020": 73, "2021": 150, "2022": 136, "2023": 128, "2024": 104, "2025": 127, "2026": 105 } },
  { territoryId: "UY-SA", career: "Notariado", ingresos: { "2020": 50, "2021": 60, "2022": 62, "2023": 64, "2024": 68, "2025": 73, "2026": 74 } },
  { territoryId: "UY-SA", career: "Químico", ingresos: { "2020": 13, "2021": 10, "2022": 10, "2023": 7, "2024": 7, "2025": 10, "2026": 6 } },
  { territoryId: "UY-SA", career: "Químico farmacéutico", ingresos: { "2020": 1, "2021": 3, "2022": 7, "2023": 11, "2024": 4, "2025": 7, "2026": 6 } },
  { territoryId: "UY-SA", career: "Técnico en Interpretación: Guitarra", ingresos: { "2020": 4, "2021": 2, "2022": 0, "2023": 2, "2024": 2, "2025": 5, "2026": 1 } },
  { territoryId: "UY-SA", career: "Técnico en Interpretación: Piano", ingresos: { "2020": 3, "2021": 0, "2022": 0, "2023": 3, "2024": 1, "2025": 5, "2026": 0 } },
  { territoryId: "UY-SA", career: "Técnico en Interpretación: Canto", ingresos: { "2020": 1, "2021": 0, "2022": 1, "2023": 1, "2024": 3, "2025": 2, "2026": 5 } },
  { territoryId: "UY-SA", career: "Técnico en Interpretación: Dirección de Coros", ingresos: { "2020": 0, "2021": 0, "2022": 1, "2023": 1, "2024": 3, "2025": 1, "2026": 4 } },
  { territoryId: "UY-SA", career: "TUILSU (Lengua de Señas)", ingresos: { "2020": 0, "2021": 38, "2022": 0, "2023": 7, "2024": 10, "2025": 4, "2026": 13 } },
];
