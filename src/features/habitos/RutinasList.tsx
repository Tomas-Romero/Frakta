import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { activarRutina, eliminarRutina } from '@/db/repositorios/rutinas';
import { ETIQUETA_DIA } from '@/features/horario/layoutSemana';
import { ICONOS_FITNESS, esIconoFitnessValido } from './iconosFitness';
import type { Rutina } from '@/types/models';

interface RutinasListProps {
  rutinas: Rutina[];
  onEditar: (rutina: Rutina) => void;
}

export function RutinasList({ rutinas, onEditar }: RutinasListProps) {
  const [aEliminar, setAEliminar] = useState<Rutina | null>(null);

  if (rutinas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No hay rutinas cargadas todavía.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {rutinas.map((r) => (
          <Card key={r.id}>
            <CardHeader className="flex items-center justify-between gap-2 space-y-0">
              <div className="flex items-center gap-2">
                <CardTitle>{r.nombre}</CardTitle>
                {r.activa && <Badge>Activa</Badge>}
              </div>
              <div className="flex gap-1">
                {!r.activa && (
                  <Button variant="outline" size="sm" onClick={() => void activarRutina(r.id)}>
                    <Check /> Activar
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEditar(r)}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setAEliminar(r)}>
                  <Trash2 />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {r.dias.map((d) => (
                <span key={d.dia} className="flex flex-col gap-1 rounded-md border px-2 py-1">
                  <span>
                    {ETIQUETA_DIA[d.dia]}: {d.foco.trim() || 'Descanso'} ({d.ejercicios.length})
                  </span>
                  {d.ejercicios.length > 0 && (
                    <span className="flex flex-wrap gap-1">
                      {d.ejercicios.map((e, i) => {
                        const Icono = e.icono && esIconoFitnessValido(e.icono) ? ICONOS_FITNESS[e.icono] : null;
                        return (
                          <span
                            key={i}
                            title={e.nombre}
                            className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px]"
                          >
                            {Icono && <Icono className="size-3 shrink-0" />}
                            <span className="max-w-20 truncate">{e.nombre}</span>
                          </span>
                        );
                      })}
                    </span>
                  )}
                </span>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={aEliminar !== null} onOpenChange={(open) => !open && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{aEliminar?.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarRutina(aEliminar.id);
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
