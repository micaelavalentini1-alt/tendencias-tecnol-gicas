import { describe, it, expect } from "vitest";
import { parseTendencias } from "@/lib/tendencias";
import { filtrarTendencias, resumirTendencias, ordenarPorBrecha } from "@/lib/dashboard";

const csv = "tendencia,categoria,horizonte,madurez_TRL,adopcion_hoy,potencial,brecha,fecha_ejecucion\nX,Solar,corto,7,1,5,,2026-11-12\nY,Eólica,largo,4,2,3,1,2026-11-13\n";

describe("dashboard de tendencias", () => {
  it("convierte columnas numéricas", () => {
    const r = parseTendencias("tendencia,madurez_TRL,adopcion_hoy,potencial,brecha\nX,7,1,5,4\n")[0];
    if (!r) throw new Error("Falta la fila de prueba");
    expect([r.madurez_TRL, r.adopcion_hoy, r.potencial, r.brecha]).toEqual([7, 1, 5, 4]);
  });
  it("calcula la brecha vacía como potencial menos adopción", () => {
    expect(parseTendencias(csv)[0]?.brecha).toBe(4);
  });
  it("resume indicadores con brecha promedio, corto plazo y fecha máxima", () => {
    expect(resumirTendencias(parseTendencias(csv))).toEqual({ cantidad: 2, brechaPromedio: 2.5, cortoPlazo: 1, ultimaActualizacion: "2026-11-13" });
  });
  it("filtra por horizonte y categoría", () => {
    expect(filtrarTendencias(parseTendencias(csv), "largo", "Eólica").map((t) => t.tendencia)).toEqual(["Y"]);
  });
  it("ordena por brecha descendente", () => {
    expect(ordenarPorBrecha(parseTendencias(csv)).map((t) => t.tendencia)).toEqual(["X", "Y"]);
  });
});
