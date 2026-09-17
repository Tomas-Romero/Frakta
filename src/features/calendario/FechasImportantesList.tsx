import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { eliminarFechaImportante } from '@/db/repositorios/fechasImportantes';
import { proximaOcurrencia } from './recurrencia';
import { ICONOS_FECHA, esIconoFechaValido } from './iconosFecha';
import type { FechaImportante } from '@/types/models';

const ETIQUETA_TIPO: Record<FechaImportante['tipoRecurrencia'], string> = {
  unica: 'Única',
  anual: 'Todos los años',
  mensual: 'Todos los meses',
  meses_especificos: 'Algunos meses',
};

interface FechasImportantesListProps {
  fechas: FechaImportante[];
  onEditar: (fecha: FechaImportante) => void;
}

export function FechasImportantesList({ fechas, onEditar }: FechasImportantesListProps) {
  const [aEliminar, setAEliminar] = useState<FechaImportante | null>(null);
  const hoy = new Date();

  const ordenadas = [...fechas].sort((a, b) => {
    const pa = proximaOcurrencia(a, hoy);
    const pb = proximaOcurrencia(b, hoy);
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return pa.getTime() - pb.getTime();
  });

  if (ordenadas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No hay fechas importantes cargadas todavía.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Próxima ocurrencia</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenadas.map((f) => {
              const proxima = proximaOcurrencia(f, hoy);
              const Icono = f.icono && esIconoFechaValido(f.icono) ? ICONOS_FECHA[f.icono] : null;
              return (
                <TableRow key={f.id}>
                  <TableCell className="text-muted-foreground">
                    {proxima ? format(proxima, 'd MMM yyyy', { locale: es }) : 'Ya pasó'}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 font-medium">
                      {Icono && <Icono className="size-4 shrink-0 text-muted-foreground" />}
                      {f.nombre}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ETIQUETA_TIPO[f.tipoRecurrencia]}</Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1 text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEditar(f)}>
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setAEliminar(f)}>
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
            <AlertDialogTitle>¿Eliminar "{aEliminar?.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarFechaImportante(aEliminar.id);
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
