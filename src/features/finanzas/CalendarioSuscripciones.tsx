import { useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  getDaysInMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumeroAr } from '@/lib/numeroAr';
import type { SuscripcionRecurrente } from '@/types/models';

const ETIQUETAS_DIA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function diaEfectivo(suscripcion: SuscripcionRecurrente, mes: Date): number {
  return Math.min(suscripcion.diaDelMes, getDaysInMonth(mes));
}

interface CalendarioSuscripcionesProps {
  suscripciones: SuscripcionRecurrente[];
}

export function CalendarioSuscripciones({ suscripciones }: CalendarioSuscripcionesProps) {
  const [mesActual, setMesActual] = useState(() => startOfMonth(new Date()));

  const activas = suscripciones.filter((s) => s.activa);
  const inicio = startOfMonth(mesActual);
  const fin = endOfMonth(mesActual);
  const dias = eachDayOfInterval({ start: inicio, end: fin });
  // getDay: 0=domingo..6=sábado -> convertimos a semana que arranca el lunes
  const offset = (getDay(inicio) + 6) % 7;

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setMesActual((m) => subMonths(m, 1))}>
          <ChevronLeft />
        </Button>
        <h3 className="text-sm font-medium capitalize">
          {format(mesActual, 'MMMM yyyy', { locale: es })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setMesActual((m) => addMonths(m, 1))}>
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {ETIQUETAS_DIA.map((e) => (
          <div key={e} className="py-1">
            {e}
          </div>
        ))}

        {Array.from({ length: offset }, (_, i) => (
          <div key={`vacio-${i}`} />
        ))}

        {dias.map((dia) => {
          const vencenHoy = activas.filter((s) => diaEfectivo(s, mesActual) === dia.getDate());
          return (
            <div
              key={dia.toISOString()}
              className={`flex min-h-16 flex-col gap-0.5 rounded-md border p-1 text-left ${
                isToday(dia) ? 'border-primary' : 'border-transparent'
              } ${vencenHoy.length > 0 ? 'bg-amber-600/10' : ''}`}
            >
              <span className={`text-[11px] ${isToday(dia) ? 'font-semibold text-foreground' : ''}`}>
                {dia.getDate()}
              </span>
              {vencenHoy.map((s) => (
                <span
                  key={s.id}
                  title={`${s.nombre} · $${formatNumeroAr(s.monto)}`}
                  className="truncate text-[10px] text-amber-700 dark:text-amber-400"
                >
                  {s.nombre} · ${formatNumeroAr(s.monto)}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
