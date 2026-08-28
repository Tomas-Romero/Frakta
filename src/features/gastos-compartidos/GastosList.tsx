import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
import { eliminarGasto } from '@/db/repositorios/eventosCompartidos';
import { formatNumeroAr } from '@/lib/numeroAr';
import type { GastoItem, Participante } from '@/types/models';

interface GastosListProps {
  eventoId: string;
  gastos: GastoItem[];
  participantesPorId: Map<string, Participante>;
  onEditar: (gasto: GastoItem) => void;
}

export function GastosList({ eventoId, gastos, participantesPorId, onEditar }: GastosListProps) {
  const [aEliminar, setAEliminar] = useState<GastoItem | null>(null);

  function nombres(ids: string[]): string {
    return ids.map((id) => participantesPorId.get(id)?.nombre ?? '?').join(', ');
  }

  if (gastos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Todavía no cargaste ningún gasto.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {gastos.map((g) => (
          <li key={g.id} className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{g.descripcion}</p>
                <span className="font-medium">${formatNumeroAr(g.monto)}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
                <Badge variant="outline">Pagó: {nombres(g.pagadoPor) || '—'}</Badge>
                <Badge variant="outline">Participan: {nombres(g.participantes) || '—'}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEditar(g)}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setAEliminar(g)}>
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <AlertDialog open={aEliminar !== null} onOpenChange={(open) => !open && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{aEliminar?.descripcion}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarGasto(eventoId, aEliminar.id);
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
