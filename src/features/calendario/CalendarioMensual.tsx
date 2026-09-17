import { useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ocurrenciaEnMes } from './recurrencia';
import { ICONOS_FECHA, esIconoFechaValido } from './iconosFecha';
import type { FechaImportante } from '@/types/models';

const ETIQUETAS_DIA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface CalendarioMensualProps {
  fechas: FechaImportante[];
}

export function CalendarioMensual({ fechas }: CalendarioMensualProps) {
  const [mesActual, setMesActual] = useState(() => startOfMonth(new Date()));

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
          const diaDelMes = dia.getDate();
          const fechasHoy = fechas.filter((f) => ocurrenciaEnMes(f, mesActual) === diaDelMes);
          return (
            <div
              key={dia.toISOString()}
              className={`flex min-h-16 flex-col gap-0.5 rounded-md border p-1 text-left ${
                isToday(dia) ? 'border-primary' : 'border-transparent'
              } ${fechasHoy.length > 0 ? 'bg-rose-600/10' : ''}`}
            >
              <span className={`text-[11px] ${isToday(dia) ? 'font-semibold text-foreground' : ''}`}>
                {diaDelMes}
              </span>
              {fechasHoy.map((f) => {
                const Icono = f.icono && esIconoFechaValido(f.icono) ? ICONOS_FECHA[f.icono] : null;
                return (
                  <span
                    key={f.id}
                    title={f.nombre}
                    className="flex items-center gap-1 truncate text-[10px] text-rose-700 dark:text-rose-400"
                  >
                    {Icono && <Icono className="size-3 shrink-0" />}
                    <span className="truncate">{f.nombre}</span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
