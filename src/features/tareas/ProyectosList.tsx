import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { eliminarProyecto } from '@/db/repositorios/proyectos';
import type { Proyecto, Tarea } from '@/types/models';

interface ProyectosListProps {
  proyectos: Proyecto[];
  tareas: Tarea[];
  onEditar: (proyecto: Proyecto) => void;
}

export function ProyectosList({ proyectos, tareas, onEditar }: ProyectosListProps) {
  const [aEliminar, setAEliminar] = useState<Proyecto | null>(null);

  if (proyectos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        Todavía no creaste ningún proyecto. Un proyecto te sirve para agrupar varias tareas que
        apuntan a lo mismo (ej. "Freelance - landing de un cliente").
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {proyectos.map((p) => {
          const tareasDelProyecto = tareas.filter((t) => t.proyectoId === p.id);
          const completadas = tareasDelProyecto.filter((t) => t.estado === 'completado').length;
          return (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="truncate">{p.nombre}</span>
                  <div className="flex shrink-0 gap-0.5">
                    <Button variant="ghost" size="icon-sm" onClick={() => onEditar(p)}>
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setAEliminar(p)}>
                      <Trash2 />
                    </Button>
                  </div>
                </CardTitle>
                {p.descripcion && <CardDescription>{p.descripcion}</CardDescription>}
              </CardHeader>
              <CardContent>
                <Badge variant="outline">
                  {tareasDelProyecto.length === 0
                    ? 'Sin tareas todavía'
                    : `${completadas}/${tareasDelProyecto.length} tareas completadas`}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={aEliminar !== null} onOpenChange={(open) => !open && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{aEliminar?.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Las tareas que pertenecen a este proyecto no se borran — quedan sin proyecto
              asignado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarProyecto(aEliminar.id);
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
