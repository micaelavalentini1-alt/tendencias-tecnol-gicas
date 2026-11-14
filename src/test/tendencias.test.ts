import { describe, it, expect } from "vitest";
import { parseTendencias } from "@/lib/tendencias";
describe("parseTendencias", () => {
  it("convierte columnas numéricas", () => {
    const r = parseTendencias("tendencia,madurez_TRL,adopcion_hoy,potencial,brecha\nX,7,1,5,4\n")[0]!;
    expect([r.madurez_TRL, r.adopcion_hoy, r.potencial, r.brecha]).toEqual([7, 1, 5, 4]);
  });
});
