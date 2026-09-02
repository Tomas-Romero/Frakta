import type { ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  CalendarClock,
  CreditCard,
  GraduationCap,
  ListChecks,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { db, obtenerConfig } from '@/db/db';
import { formatNumeroAr } from '@/lib/numeroAr';
import { useUiStore, type Vista } from '@/store/uiStore';
import { proximaClase } from '@/features/horario/proximaClase';
import { promedioGeneral } from '@/features/academico/metricas';
import { resumenMes, proximosVencimientos } from '@/features/finanzas/metricas';
import { parseISO, isBefore, addHours } from 'date-fns';

// El Dashboard es siempre de solo lectura: cada widget resume su módulo y
// lleva a él, nunca trae formularios de edición propios.
// Ver BLUEPRINT.md sección 1.

interface WidgetProps {
  titulo: string;
  icono: typeof CalendarClock;
  color: string;
  vista: Vista;
  children: ReactNode;
}

function Widget({ titulo, icono: Icono, color, vista, children }: WidgetProps) {
  const irA = useUiStore((s) => s.irA);
  return (
    <Card
      className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => irA(vista)}
    >
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className={cn('flex size-8 items-center justify-center rounded-lg', color)}>
            <Icono className="size-4" />
          </span>
          <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Dashboard() {
  const materias = useLiveQuery(() => db.materias.toArray(), [], []);
  const bloques = useLiveQuery(() => db.bloquesHorario.toArray(), [], []);
  const tareas = useLiveQuery(() => db.tareas.toArray(), [], []);
  const movimientos = useLiveQuery(() => db.movimientos.toArray(), [], []);
  const presupuestos = useLiveQuery(() => db.presupuestos.toArray(), [], []);
  const suscripciones = useLiveQuery(() => db.suscripciones.toArray(), [], []);
  const config = useLiveQuery(() => obtenerConfig());

  if (!materias || !bloques || !tareas || !movimientos || !presupuestos || !suscripciones || !config) {
    return null;
  }

  const ahora = new Date();
  const proxima = proximaClase(bloques, ahora);
  const materiaProxima = proxima?.bloque.materiaId
    ? materias.find((m) => m.id === proxima.bloque.materiaId)
    : null;
  const tituloProxima = materiaProxima?.nombre ?? proxima?.bloque.titulo ?? null;

  const limite48h = addHours(ahora, 48);
  const tareasPorVencer = tareas
    .filter((t) => t.estado !== 'completado' && t.fechaLimite !== null)
    .filter((t) => isBefore(parseISO(t.fechaLimite!), limite48h))
    .sort((a, b) => a.fechaLimite!.localeCompare(b.fechaLimite!));

  const resumen = resumenMes(movimientos, ahora);
  const totalPresupuestado = presupuestos.reduce((acc, p) => acc + p.montoMensual, 0);

  const promedio = promedioGeneral(materias);

  const debitosProximos = proximosVencimientos(suscripciones, ahora, 7);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Widget titulo="Próxima clase" icono={CalendarClock} color="bg-brand-green/15 text-brand-green" vista="horario">
        {proxima && tituloProxima ? (
          <>
            <p className="font-medium">{tituloProxima}</p>
            <CardDescription>{proxima.cuando}</CardDescription>
          </>
        ) : (
          <CardDescription>No hay nada cargado en el horario.</CardDescription>
        )}
      </Widget>

      <Widget titulo="Tareas por vencer (48h)" icono={ListChecks} color="bg-destructive/15 text-destructive" vista="tareas">
        {tareasPorVencer.length > 0 ? (
          <>
            <p className="font-medium">{tareasPorVencer[0].titulo}</p>
            <CardDescription>
              {tareasPorVencer.length > 1
                ? `+ ${tareasPorVencer.length - 1} más`
                : 'Vence pronto'}
            </CardDescription>
          </>
        ) : (
          <CardDescription>Nada por vencer en las próximas 48 h.</CardDescription>
        )}
      </Widget>

      <Widget titulo="Gasto del mes vs. presupuesto" icono={Wallet} color="bg-brand-gold/20 text-[#8a6d1f] dark:text-brand-gold" vista="finanzas">
        <p className="font-medium">
          ${formatNumeroAr(resumen.gastos)}
          {totalPresupuestado > 0 && (
            <span className="text-muted-foreground"> / ${formatNumeroAr(totalPresupuestado)}</span>
          )}
        </p>
        <CardDescription>
          {totalPresupuestado === 0 ? 'Sin presupuesto configurado' : 'este mes'}
        </CardDescription>
      </Widget>

      <Widget titulo="Promedio académico" icono={GraduationCap} color="bg-sky-600/15 text-sky-700 dark:text-sky-400" vista="academico">
        <p className="text-xl font-semibold">
          {promedio === null ? '—' : formatNumeroAr(Math.round(promedio * 100) / 100)}
        </p>
        <CardDescription>{config.escalaNotas === '0-100' ? 'escala 0-100' : 'escala 1-10'}</CardDescription>
      </Widget>

      <Widget titulo="Débitos automáticos próximos" icono={CreditCard} color="bg-purple-600/15 text-purple-700 dark:text-purple-400" vista="finanzas">
        {debitosProximos.length > 0 ? (
          <>
            <p className="font-medium">
              {debitosProximos[0].suscripcion.nombre} — ${formatNumeroAr(debitosProximos[0].suscripcion.monto)}
            </p>
            <CardDescription>
              {debitosProximos.length > 1 ? `+ ${debitosProximos.length - 1} más esta semana` : 'esta semana'}
            </CardDescription>
          </>
        ) : (
          <CardDescription>Nada programado para los próximos 7 días.</CardDescription>
        )}
      </Widget>
    </div>
  );
}
