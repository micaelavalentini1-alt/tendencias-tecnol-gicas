import Papa from "papaparse";

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQY2Tkhj04D3ATjxYksPKkHYk39MEkt_iK71z2_vgQ5E2HBitaiGBQLs0kTvKXdPEb_JnF4wxdGcvbX/pub?gid=0&single=true&output=csv";

export type Tendencia = {
  fecha_ejecucion: string; tendencia: string; categoria: string; descripcion: string;
  horizonte: string; madurez_TRL: number; adopcion_hoy: number; potencial: number; brecha: number;
  regiones: string; barreras: string; fuente_url: string; cita_APA: string; fecha_fuente: string; confianza: string;
};

const NUM = ["madurez_TRL", "adopcion_hoy", "potencial", "brecha"] as const;

export function parseTendencias(csv: string): Tendencia[] {
  const res = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  return res.data
    .filter((r) => r.tendencia?.trim())
    .map((r) => {
      const o: Record<string, unknown> = { ...r };
      for (const k of NUM) { const n = Number(String(r[k] ?? "").replace(",", ".")); o[k] = Number.isFinite(n) ? n : 0; }
      return o as Tendencia;
    });
}

export async function fetchTendencias(): Promise<Tendencia[]> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status} al leer el CSV`);
  return parseTendencias(await res.text());
}
