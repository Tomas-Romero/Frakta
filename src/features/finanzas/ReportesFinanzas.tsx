import { useState } from 'react';
import { addMonths, format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fijarPresupuesto } from '@/db/repositorios/presupuestos';
import { formatNumeroAr, parseNumeroAr } from '@/lib/numeroAr';
import {
  gastoPorCategoria,
  presupuestoVsReal,
  resumenMes,
} from './metricas';
import type { MovimientoFinanciero, Presupuesto } from '@/types/models';

const PALETA = ['#b5793a', '#2d7d6c', '#a6493e', '#4d6fa6', '#8a6ca6', '#c2a13a', '#5a8a45'];

function formatearMontoTooltip(valor: unknown): string {
  return `$${formatNumeroAr(Number(valor))}`;
}

interface ReportesFinanzasProps {
  movimientos: MovimientoFinanciero[];
  presupuestos: Presupuesto[];
}

export function ReportesFinanzas({ movimientos, presupuestos }: ReportesFinanzasProps) {
  const [mes, setMes] = useState(() => new Date());

  const resumen = resumenMes(movimientos, mes);
  const porCategoria = gastoPorCategoria(movimientos, mes);
  const comparacion = presupuestoVsReal(movimientos, presupuestos, mes);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setMes((m) => subMonths(m, 1))}>
          <ChevronLeft />
        </Button>
        <h3 className="min-w-36 text-center text-sm font-medium capitalize">
          {format(mes, 'MMMM yyyy', { locale: es })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setMes((m) => addMonths(m, 1))}>
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Ingresos</CardDescription>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
              ${formatNumeroAr(resumen.ingresos)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Gastos</CardDescription>
            <CardTitle className="text-2xl text-destructive">
              ${formatNumeroAr(resumen.gastos)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Balance</CardDescription>
            <CardTitle className="text-2xl">${formatNumeroAr(resumen.balance)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-medium">Gastos por categoría</h4>
          {porCategoria.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Sin gastos este mes.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={porCategoria}
                  dataKey="monto"
                  nameKey="categoria"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {porCategoria.map((_, i) => (
                    <Cell key={i} fill={PALETA[i % PALETA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatearMontoTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium">Presupuesto vs. real</h4>
          {comparacion.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Sin presupuestos ni gastos este mes.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparacion}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={formatearMontoTooltip} />
                <Legend />
                <Bar dataKey="presupuestado" name="Presupuestado" fill="#8a6ca6" radius={4} />
                <Bar dataKey="real" name="Real" fill="#b5793a" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <EditorPresupuestos categorias={porCategoria.map((c) => c.categoria)} presupuestos={presupuestos} />
    </div>
  );
}

function EditorPresupuestos({
  categorias,
  presupuestos,
}: {
  categorias: string[];
  presupuestos: Presupuesto[];
}) {
  const presupuestoPorCategoria = new Map(presupuestos.map((p) => [p.categoria, p.montoMensual]));
  const todasLasCategorias = [...new Set([...categorias, ...presupuestoPorCategoria.keys()])].sort();

  if (todasLasCategorias.length === 0) return null;

  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">Presupuesto mensual por categoría</h4>
      <div className="flex flex-col gap-2">
        {todasLasCategorias.map((categoria) => (
          <FilaPresupuesto
            key={categoria}
            categoria={categoria}
            montoActual={presupuestoPorCategoria.get(categoria) ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

function FilaPresupuesto({ categoria, montoActual }: { categoria: string; montoActual: number }) {
  const [texto, setTexto] = useState(montoActual > 0 ? formatNumeroAr(montoActual) : '');

  function guardar() {
    let monto = 0;
    try {
      monto = texto.trim() === '' ? 0 : parseNumeroAr(texto);
    } catch {
      return;
    }
    void fijarPresupuesto(categoria, monto);
  }

  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <span className="flex-1 text-sm">{categoria}</span>
      <Input
        inputMode="decimal"
        placeholder="Sin presupuesto"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={guardar}
        className="w-32"
      />
    </div>
  );
}
