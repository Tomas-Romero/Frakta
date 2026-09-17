import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { eliminarRegistroEjercicio } from '@/db/repositorios/registrosEjercicio';
import { formatNumeroAr } from '@/lib/numeroAr';
import { prPorEjercicio } from './metricas';
import { ICONOS_FITNESS, esIconoFitnessValido } from './iconosFitness';
import type { RegistroEjercicio } from '@/types/models';

const ETIQUETA_TIPO: Record<RegistroEjercicio['tipo'], string> = {
  fuerza: 'Fuerza',
  triserie_core: 'Triserie core',
  cardio: 'Cardio',
};

function resumen(r: RegistroEjercicio): string {
  if (r.tipo === 'fuerza') {
    const sets = r.seriesRealizadas ?? [];
    if (sets.length === 0) return r.nombreEjercicio ?? '—';
    const detalle = sets.map((s) => `${s.repeticiones}×${formatNumeroAr(s.pesoKg)}kg`).join(', ');
    return `${r.nombreEjercicio} — ${detalle}`;
  }
  if (r.tipo === 'triserie_core') {
    return (r.ejerciciosTriserie ?? []).map((e) => e.nombre).join(' + ') || '—';
  }
  return `${formatNumeroAr(r.duracionMin ?? 0)} min${
    r.distanciaKm !== null ? ` — ${formatNumeroAr(r.distanciaKm)} km` : ''
  }`;
}

function pesoMaximoDeSesion(r: RegistroEjercicio): number {
  return (r.seriesRealizadas ?? []).reduce((max, s) => Math.max(max, s.pesoKg), 0);
}

interface RegistroEjercicioListProps {
  registros: RegistroEjercicio[];
  onEditar: (registro: RegistroEjercicio) => void;
}

export function RegistroEjercicioList({ registros, onEditar }: RegistroEjercicioListProps) {
  const [aEliminar, setAEliminar] = useState<RegistroEjercicio | null>(null);

  const ordenados = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const records = prPorEjercicio(registros);

  if (ordenados.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No hay sesiones registradas todavía.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenados.map((r) => {
              const Icono = r.icono && esIconoFitnessValido(r.icono) ? ICONOS_FITNESS[r.icono] : null;
              const esPR =
                r.tipo === 'fuerza' &&
                r.nombreEjercicio !== null &&
                pesoMaximoDeSesion(r) > 0 &&
                pesoMaximoDeSesion(r) >= (records.get(r.nombreEjercicio) ?? 0);
              return (
                <TableRow key={r.id}>
                  <TableCell>{format(parseISO(r.fecha), 'd MMM yyyy', { locale: es })}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ETIQUETA_TIPO[r.tipo]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      {Icono && <Icono className="size-4 shrink-0" />}
                      {resumen(r)}
                      {esPR && <Badge className="shrink-0">PR</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1 text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEditar(r)}>
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setAEliminar(r)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={aEliminar !== null} onOpenChange={(open) => !open && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarRegistroEjercicio(aEliminar.id);
                setAEliminar(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
