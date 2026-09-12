import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumeroAr } from '@/lib/numeroAr';
import type { RegistroNutricion } from '@/types/models';

const DIAS_HISTORIAL = 14;

interface NutricionHistorialProps {
  registros: RegistroNutricion[];
}

export function NutricionHistorial({ registros }: NutricionHistorialProps) {
  const porFecha = new Map(registros.map((r) => [r.fecha, r]));
  const hoy = new Date();
  const dias: RegistroNutricion[] = Array.from({ length: DIAS_HISTORIAL }, (_, i) => {
    const fecha = format(subDays(hoy, i), 'yyyy-MM-dd');
    return porFecha.get(fecha) ?? { fecha, proteinaObjetivoG: 0, proteinaLogradaG: 0, creatinaTomada: false };
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Día</TableHead>
            <TableHead className="text-right">Proteína</TableHead>
            <TableHead className="text-right">Creatina</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dias.map((r) => (
            <TableRow key={r.fecha}>
              <TableCell className="capitalize">
                {format(parseISO(r.fecha), 'EEE d MMM', { locale: es })}
              </TableCell>
              <TableCell className="text-right">
                {formatNumeroAr(r.proteinaLogradaG)}
                <span className="text-muted-foreground"> / {formatNumeroAr(r.proteinaObjetivoG)} g</span>
              </TableCell>
              <TableCell className="text-right">
                {r.creatinaTomada ? (
                  <Check className="ml-auto size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="ml-auto size-4 text-muted-foreground" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
