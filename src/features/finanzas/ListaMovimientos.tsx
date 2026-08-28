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
import { eliminarMovimiento } from '@/db/repositorios/movimientos';
import { formatNumeroAr } from '@/lib/numeroAr';
import type { MovimientoFinanciero } from '@/types/models';

interface ListaMovimientosProps {
  movimientos: MovimientoFinanciero[];
  onEditar: (movimiento: MovimientoFinanciero) => void;
}

export function ListaMovimientos({ movimientos, onEditar }: ListaMovimientosProps) {
  const [aEliminar, setAEliminar] = useState<MovimientoFinanciero | null>(null);

  const ordenados = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (ordenados.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No hay movimientos cargados todavía.
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
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenados.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{format(parseISO(m.fecha), 'd MMM yyyy', { locale: es })}</TableCell>
                <TableCell>{m.categoria}</TableCell>
                <TableCell className="text-muted-foreground">{m.descripcion || '—'}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    m.tipo === 'gasto'
                      ? 'text-destructive'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {m.tipo === 'gasto' ? '-' : '+'}${formatNumeroAr(m.monto)}
                </TableCell>
                <TableCell className="flex justify-end gap-1 text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEditar(m)}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setAEliminar(m)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={aEliminar !== null} onOpenChange={(open) => !open && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              {aEliminar?.categoria} — ${aEliminar ? formatNumeroAr(aEliminar.monto) : ''}. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarMovimiento(aEliminar.id);
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
