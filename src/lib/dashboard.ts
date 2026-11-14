import type { Tendencia } from "./tendencias";

export const HORIZONTES = ["corto", "mediano", "largo"] as const;
export function horizonteDe(value: string) {
  return value.trim().toLowerCase();
}

export function filtrarTendencias(rows: Tendencia[], horizonte: string, categoria: string) {
  return rows.filter((row) =>
    (horizonte === "todos" || horizonteDe(row.horizonte) === horizonte) &&
    (categoria === "todas" || row.categoria === categoria));
}

export function resumirTendencias(rows: Tendencia[]) {
  const dates = rows.map((row) => ({ value: row.fecha_ejecucion, time: Date.parse(row.fecha_ejecucion) }))
    .filter((date) => Number.isFinite(date.time)).sort((a, b) => b.time - a.time);
  return {
    cantidad: rows.length,
    brechaPromedio: rows.length ? rows.reduce((sum, row) => sum + row.brecha, 0) / rows.length : 0,
    cortoPlazo: rows.filter((row) => horizonteDe(row.horizonte) === "corto").length,
    ultimaActualizacion: dates[0]?.value ?? "—",
  };
}

export function ordenarPorBrecha(rows: Tendencia[]) {
  return [...rows].sort((a, b) => b.brecha - a.brecha);
}

export function agruparHorizontes(rows: Tendencia[], categorias: string[]) {
  return HORIZONTES.map((horizonte) => ({
    horizonte,
    ...Object.fromEntries(categorias.map((categoria, index) => [
      `categoria${index}`,
      rows.filter((row) => horizonteDe(row.horizonte) === horizonte && row.categoria === categoria).length,
    ])),
  }));
}

export function agruparConfianza(rows: Tendencia[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const name = row.confianza?.trim().toLowerCase() || "sin dato";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts].map(([name, value]) => ({ name, value }));
}