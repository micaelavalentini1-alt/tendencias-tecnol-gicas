import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTendencias, type Tendencia } from "@/lib/tendencias";
import { filtrarTendencias, resumirTendencias, ordenarPorBrecha, HORIZONTES } from "@/lib/dashboard";
import { TendenciasCharts } from "@/components/tendencias-charts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radar de Tendencias Energéticas" },
      { name: "description", content: "Panel de tendencias energéticas con adopción, potencial, brecha y fuentes." },
      { property: "og:title", content: "Radar de Tendencias Energéticas" },
      { property: "og:description", content: "Panel de tendencias energéticas con adopción, potencial, brecha y fuentes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const q = useQuery({ queryKey: ["tendencias"], queryFn: fetchTendencias, staleTime: 0, retry: false });
  const [horizonte, setHorizonte] = useState("todos");
  const [categoria, setCategoria] = useState("todas");
  const [selected, setSelected] = useState<string | null>(null);
  const data = q.data ?? [];
  const categorias = useMemo(() => [...new Set(data.map((t) => t.categoria))].sort(), [data]);
  const rows = useMemo(() => filtrarTendencias(data, horizonte, categoria), [data, horizonte, categoria]);
  const summary = resumirTendencias(rows);

  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Panel de vigilancia</p><h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Radar de Tendencias Energéticas</h1></div>
      <Button onClick={() => q.refetch()} disabled={q.isFetching}>{q.isFetching ? "Actualizando…" : "Actualizar datos"}</Button>
    </header>
    {q.isPending ? <div role="status" className="flex items-center gap-3 py-20 text-muted-foreground"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />Cargando datos…</div>
    : q.isError ? <div role="alert" className="border-l-4 border-destructive bg-destructive/10 p-6 text-sm"><p className="font-semibold text-destructive">No se pudieron cargar los datos.</p><p className="mt-2 break-words font-mono text-xs text-foreground">{q.error.message}</p><Button className="mt-4" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>{q.isFetching ? "Reintentando…" : "Reintentar"}</Button></div>
    : <>
      <section className="mb-8 grid gap-3 sm:grid-cols-2" aria-label="Filtros">
        <Filter label="Horizonte" value={horizonte} onChange={setHorizonte} options={[["todos", "Todos los horizontes"], ...HORIZONTES.map((h) => [h, h.charAt(0).toUpperCase() + h.slice(1)] as [string, string])]} />
        <Filter label="Categoría" value={categoria} onChange={setCategoria} options={[["todas", "Todas las categorías"], ...categorias.map((c) => [c, c] as [string, string])]} />
      </section>
      <section className="mb-10 grid grid-cols-2 border-y lg:grid-cols-4" aria-label="Indicadores">
        <Metric label="Tendencias" value={summary.cantidad} />
        <Metric label="Brecha promedio" value={summary.brechaPromedio.toFixed(1)} />
        <Metric label="Corto plazo" value={summary.cortoPlazo} />
        <Metric label="Última actualización" value={summary.ultimaActualizacion} />
      </section>
      {rows.length === 0 ? <p className="border-y py-16 text-center text-muted-foreground">No hay tendencias para estos filtros.</p> : <>
        <TendenciasCharts rows={rows} />
        <Table rows={ordenarPorBrecha(rows)} selected={selected} onSelect={setSelected} />
      </>}
    </>}
    <footer className="mt-12 border-t pt-5 text-xs text-muted-foreground">Datos recolectados por un agente de IA. Los puntajes son estimaciones del modelo; verificar las fuentes.</footer>
  </main>;
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <label className="text-sm font-medium">{label}<Select value={value} onValueChange={onChange}><SelectTrigger className="mt-2 bg-card" aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{options.map(([v, text]) => <SelectItem key={v} value={v}>{text}</SelectItem>)}</SelectContent></Select></label>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="border-b border-r px-4 py-5 last:border-r-0 lg:border-b-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</p></div>;
}

function Table({ rows, selected, onSelect }: { rows: Tendencia[]; selected: string | null; onSelect: (value: string | null) => void }) {
  return <section className="mt-8" aria-label="Tabla de tendencias">
    <h2 className="mb-4 font-display text-xl font-semibold">Detalle de tendencias</h2>
    <div className="overflow-x-auto border-y"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-muted text-xs text-muted-foreground"><tr><th className="p-3">Tendencia</th><th className="p-3">Horizonte</th><th className="p-3">Brecha</th><th className="p-3">Confianza</th><th className="p-3">Fuente</th></tr></thead><tbody>
      {rows.map((t, i) => { const id = `${t.tendencia}-${i}`; const open = selected === id; return <FragmentRow key={id} t={t} open={open} onClick={() => onSelect(open ? null : id)} />; })}
    </tbody></table></div>
  </section>;
}

function FragmentRow({ t, open, onClick }: { t: Tendencia; open: boolean; onClick: () => void }) {
  return <>
    <tr tabIndex={0} aria-expanded={open} onClick={onClick} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }} className="cursor-pointer border-t hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none">
      <td className="p-3 font-medium">{t.tendencia}</td><td className="p-3 capitalize">{t.horizonte}</td><td className="p-3 tabular-nums">{t.brecha}</td><td className="p-3 capitalize">{t.confianza}</td>
      <td className="p-3">{t.fuente_url ? <a href={t.fuente_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary underline underline-offset-2">Ver fuente</a> : "—"}</td>
    </tr>
    {open && <tr className="bg-muted/50"><td colSpan={5} className="space-y-3 p-4 text-sm"><Detail label="Descripción" value={t.descripcion} /><Detail label="Barreras" value={t.barreras} /><Detail label="Regiones" value={t.regiones} /><Detail label="Cita APA" value={t.cita_APA} /></td></tr>}
  </>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <p><span className="font-semibold">{label}: </span><span className="text-muted-foreground">{value || "—"}</span></p>;
}
