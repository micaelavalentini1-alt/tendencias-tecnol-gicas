import type { CSSProperties } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell, Legend } from "recharts";
import type { Tendencia } from "@/lib/tendencias";
import { HORIZONTES, horizonteDe, ordenarPorBrecha, agruparHorizontes, agruparConfianza } from "@/lib/dashboard";

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"];
const horizonColors = { corto: "var(--horizon-short)", mediano: "var(--horizon-medium)", largo: "var(--horizon-long)" };
const tooltipStyle = { background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 6 };
const axis = { fill: "var(--muted-foreground)", fontSize: 11 };

export function TendenciasCharts({ rows }: { rows: Tendencia[] }) {
  const sorted = ordenarPorBrecha(rows);
  const categorias = [...new Set(rows.map((row) => row.categoria))].sort();
  const stacked = agruparHorizontes(rows, categorias);
  const confidence = agruparConfianza(rows);
  return <div className="space-y-8">
    <section className="border-b pb-8" aria-label="Adopción y potencial">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-semibold">Adopción y potencial</h2><div className="flex gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 bg-primary" />Adopción hoy</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 bg-comparison" />Potencial</span></div></div>
      <div className="max-h-[540px] overflow-y-auto overflow-x-hidden border-y bg-card py-3">
        <div className="h-[var(--chart-height)] min-h-64 w-full" style={{ "--chart-height": `${Math.max(280, sorted.length * 64)}px` } as CSSProperties}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 22, left: 0, bottom: 4 }} barGap={3}>
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis type="number" domain={[0, 'dataMax']} tick={axis} allowDecimals={false} />
            <YAxis type="category" dataKey="tendencia" width={170} interval={0} tick={{ ...axis, fontSize: 10 }} tickFormatter={(value: string) => value.length > 31 ? `${value.slice(0, 30)}…` : value} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="adopcion_hoy" name="Adopción hoy" fill="var(--primary)" barSize={13} radius={[0, 3, 3, 0]} isAnimationActive={false} />
            <Bar dataKey="potencial" name="Potencial" fill="var(--comparison)" barSize={13} radius={[0, 3, 3, 0]} isAnimationActive={false} />
          </BarChart></ResponsiveContainer>
        </div>
      </div>
    </section>
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="min-w-0 border-b pb-8" aria-label="Tendencias por horizonte">
        <h2 className="mb-5 font-display text-xl font-semibold">Horizonte por categoría</h2>
        <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={stacked} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="horizonte" tick={axis} /><YAxis allowDecimals={false} tick={axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
          {categorias.map((categoria, i) => <Bar key={categoria} dataKey={`categoria${i}`} name={categoria} stackId="horizonte" fill={palette[i % palette.length]} maxBarSize={70} isAnimationActive={false} />)}
        </BarChart></ResponsiveContainer></div>
        <div className="mt-4 grid max-h-40 grid-cols-1 gap-2 overflow-y-auto text-xs text-muted-foreground sm:grid-cols-2">{categorias.map((categoria, i) => <span key={categoria} className="flex items-start gap-2"><svg className="mt-0.5 size-2.5 shrink-0" viewBox="0 0 10 10"><rect width="10" height="10" fill={palette[i % palette.length]} /></svg>{categoria}</span>)}</div>
      </section>
      <section className="min-w-0 border-b pb-8" aria-label="Dispersión de tendencias">
        <h2 className="mb-5 font-display text-xl font-semibold">Adopción vs. potencial</h2>
        <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 12, right: 24, bottom: 30, left: 0 }}>
          <CartesianGrid stroke="var(--border)" /><XAxis type="number" dataKey="adopcion_hoy" name="Adopción hoy" domain={[0, 'dataMax']} tick={axis} allowDecimals={false} label={{ value: "Adopción hoy", position: "bottom", fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis type="number" dataKey="potencial" name="Potencial" domain={[0, 'dataMax']} tick={axis} allowDecimals={false} label={{ value: "Potencial", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip content={({ active, payload }) => {
            const points = payload?.[0]?.payload as Tendencia | undefined;
            return active && points ? <div className="max-w-64 rounded-md border bg-popover p-3 text-xs text-popover-foreground"><p className="mb-2 font-semibold">{points.tendencia}</p><p>Adopción: {points.adopcion_hoy} · Potencial: {points.potencial}</p><p>Horizonte: {points.horizonte}</p></div> : null;
          }} />
          {HORIZONTES.map((horizonte) => <Scatter key={horizonte} name={horizonte} data={rows.filter((row) => horizonteDe(row.horizonte) === horizonte)} fill={horizonColors[horizonte]} fillOpacity={0.7} isAnimationActive={false} />)}
        </ScatterChart></ResponsiveContainer></div>
        <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs">{HORIZONTES.map((h) => <span key={h} className="flex items-center gap-2 capitalize"><svg viewBox="0 0 10 10" className="size-2.5"><circle cx="5" cy="5" r="5" fill={horizonColors[h]} /></svg>{h}</span>)}</div>
      </section>
    </div>
    <section className="border-b pb-8" aria-label="Confianza de las tendencias">
      <h2 className="font-display text-xl font-semibold">Confianza de las fuentes</h2>
      <div className="mx-auto h-72 max-w-lg"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={confidence} dataKey="value" nameKey="name" innerRadius={65} outerRadius={96} paddingAngle={3} isAnimationActive={false}>{confidence.map((entry, i) => <Cell key={entry.name} fill={palette[i % palette.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend formatter={(value) => <span className="text-xs capitalize text-foreground">{value}</span>} /></PieChart></ResponsiveContainer></div>
    </section>
  </div>;
}
