import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { eliminarMateria } from '@/db/repositorios/materias';
import { formatNumeroAr } from '@/lib/numeroAr';
import type { EstadoMateria, Materia } from '@/types/models';

const COLOR_ESTADO: Record<EstadoMateria, string> = {
  Aprobado: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400',
  Cursando: 'bg-amber-600/15 text-amber-700 dark:text-amber-400',
  Regular: 'bg-sky-600/15 text-sky-700 dark:text-sky-400',
  PorCursar: 'bg-muted text-muted-foreground',
};

interface MateriasListProps {
  materias: Materia[];
  onEditar: (materia: Materia) => void;
}

export function MateriasList({ materias, onEditar }: MateriasListProps) {
  const [aEliminar, setAEliminar] = useState<Materia | null>(null);

  if (materias.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        Todavía no cargaste ninguna materia.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Materia</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Hs/semana</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materias.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.nombre}</TableCell>
                <TableCell>{m.anioCursado}</TableCell>
                <TableCell>{formatNumeroAr(m.cargaHoraria.semanal)}</TableCell>
                <TableCell>{m.nota === null ? '—' : formatNumeroAr(m.nota)}</TableCell>
                <TableCell>
                  <Badge className={COLOR_ESTADO[m.estado]} variant="secondary">
                    {m.estado}
                  </Badge>
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
            <AlertDialogTitle>¿Eliminar "{aEliminar?.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>
              También se eliminan los bloques de horario asociados a esta materia. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarMateria(aEliminar.id);
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
