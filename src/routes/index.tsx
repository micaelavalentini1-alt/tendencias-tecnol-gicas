import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTendencias, type Tendencia } from "@/lib/tendencias";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radar de Tendencias Energéticas" },
      { name: "description", content: "Tendencias en energía renovable: madurez, adopción, potencial y brecha." },
      { property: "og:title", content: "Radar de Tendencias Energéticas" },
      { property: "og:description", content: "Tendencias en energía renovable: madurez, adopción, potencial y brecha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="text-xs">
      <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="font-mono text-foreground">{value}/{max}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
    </div>
  );
}

function Card({ t }: { t: Tendencia }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{t.categoria}</span>
        <span className="rounded-full border px-2 py-0.5 text-muted-foreground">Horizonte {t.horizonte}</span>
        <span className="rounded-full border px-2 py-0.5 text-muted-foreground">Confianza {t.confianza}</span>
      </div>
      <h2 className="font-display text-lg font-semibold leading-snug">{t.tendencia}</h2>
      <p className="text-sm text-muted-foreground">{t.descripcion}</p>
      <div className="grid grid-cols-2 gap-3">
        <Bar label="Madurez TRL" value={t.madurez_TRL} max={9} />
        <Bar label="Adopción hoy" value={t.adopcion_hoy} max={5} />
        <Bar label="Potencial" value={t.potencial} max={5} />
        <Bar label="Brecha" value={t.brecha} max={5} />
      </div>
      <dl className="space-y-1 text-xs">
        <div><dt className="inline font-semibold">Regiones: </dt><dd className="inline text-muted-foreground">{t.regiones}</dd></div>
        <div><dt className="inline font-semibold">Barreras: </dt><dd className="inline text-muted-foreground">{t.barreras}</dd></div>
      </dl>
      {t.fuente_url && <a href={t.fuente_url} target="_blank" rel="noreferrer" className="mt-auto text-xs text-primary underline underline-offset-2">Fuente ({t.fecha_fuente})</a>}
    </article>
  );
}

function Index() {
  const q = useQuery({ queryKey: ["tendencias"], queryFn: fetchTendencias, staleTime: 0 });
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Radar de Tendencias Energéticas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {q.data ? `${q.data.length} tendencias · última ejecución ${q.data[0]?.fecha_ejecucion ?? "-"}` : "Datos en vivo desde Google Sheets"}
          </p>
        </div>
        <button onClick={() => q.refetch()} disabled={q.isFetching}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
          {q.isFetching ? "Actualizando…" : "Actualizar datos"}
        </button>
      </header>
      {q.isPending ? (
        <div className="flex items-center gap-3 py-20 text-muted-foreground"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />Cargando datos…</div>
      ) : q.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm">
          <p className="font-semibold text-destructive">No se pudieron cargar los datos.</p>
          <p className="mt-1 text-muted-foreground">{(q.error as Error).message}. Probá con "Actualizar datos".</p>
        </div>
      ) : q.data.length === 0 ? (
        <p className="py-20 text-muted-foreground">La planilla no tiene filas.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{q.data.map((t, i) => <Card key={i} t={t} />)}</div>
      )}
    </main>
  );
}
