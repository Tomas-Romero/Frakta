import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { actualizarSuscripcion, eliminarSuscripcion } from '@/db/repositorios/suscripciones';
import { formatNumeroAr } from '@/lib/numeroAr';
import type { SuscripcionRecurrente } from '@/types/models';

interface ListaSuscripcionesProps {
  suscripciones: SuscripcionRecurrente[];
  onEditar: (suscripcion: SuscripcionRecurrente) => void;
}

export function ListaSuscripciones({ suscripciones, onEditar }: ListaSuscripcionesProps) {
  const [aEliminar, setAEliminar] = useState<SuscripcionRecurrente | null>(null);

  if (suscripciones.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No hay suscripciones cargadas todavía.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {suscripciones.map((s) => (
          <li key={s.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
            <Checkbox
              checked={s.activa}
              onCheckedChange={(marcado) => void actualizarSuscripcion(s.id, { activa: !!marcado })}
            />
            <div className="min-w-0 flex-1">
              <p className={s.activa ? '' : 'text-muted-foreground line-through'}>{s.nombre}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline">{s.categoria}</Badge>
                <span>día {s.diaDelMes}</span>
              </div>
            </div>
            <span className="font-medium">${formatNumeroAr(s.monto)}</span>
            <Button variant="ghost" size="icon" onClick={() => onEditar(s)}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setAEliminar(s)}>
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

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
                if (aEliminar) void eliminarSuscripcion(aEliminar.id);
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
