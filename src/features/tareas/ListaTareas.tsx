import { useState } from 'react';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, Pencil, Timer, Trash2 } from 'lucide-react';
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
import { cambiarEstadoTarea, eliminarTarea } from '@/db/repositorios/tareas';
import { usePomodoroStore } from '@/store/pomodoroStore';
import type { Materia, Prioridad, Proyecto, Tarea } from '@/types/models';

const COLOR_PRIORIDAD: Record<Prioridad, string> = {
  alta: 'bg-red-600/15 text-red-700 dark:text-red-400',
  media: 'bg-amber-600/15 text-amber-700 dark:text-amber-400',
  baja: 'bg-muted text-muted-foreground',
};

const ORDEN_PRIORIDAD: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

interface ListaTareasProps {
  tareas: Tarea[];
  proyectosPorId: Map<string, Proyecto>;
  materiasPorId: Map<string, Materia>;
  onEditar: (tarea: Tarea) => void;
}

export function ListaTareas({ tareas, proyectosPorId, materiasPorId, onEditar }: ListaTareasProps) {
  const [aEliminar, setAEliminar] = useState<Tarea | null>(null);
  const enfocarTarea = usePomodoroStore((s) => s.enfocarTarea);
  const hoy = startOfToday();

  const ordenadas = [...tareas].sort((a, b) => {
    if (a.estado === 'completado' && b.estado !== 'completado') return 1;
    if (b.estado === 'completado' && a.estado !== 'completado') return -1;
    if (a.fechaLimite && b.fechaLimite) return a.fechaLimite.localeCompare(b.fechaLimite);
    if (a.fechaLimite) return -1;
    if (b.fechaLimite) return 1;
    return ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
  });

  if (ordenadas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No hay tareas todavía.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {ordenadas.map((t) => {
          const completada = t.estado === 'completado';
          const vencida =
            !completada && t.fechaLimite !== null && isBefore(parseISO(t.fechaLimite), hoy);
          const proyecto = t.proyectoId ? proyectosPorId.get(t.proyectoId) : undefined;
          const materia = t.materiaId ? materiasPorId.get(t.materiaId) : undefined;

          return (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
            >
              <button
                type="button"
                onClick={() =>
                  void cambiarEstadoTarea(t.id, completada ? 'por_hacer' : 'completado')
                }
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                {completada ? <CheckCircle2 className="text-emerald-600" /> : <Circle />}
              </button>

              <div className="min-w-0 flex-1">
                <p className={completada ? 'truncate line-through text-muted-foreground' : 'truncate'}>
                  {t.titulo}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="secondary" className={COLOR_PRIORIDAD[t.prioridad]}>
                    {t.prioridad}
                  </Badge>
                  <Badge variant="outline">{t.tipo}</Badge>
                  {materia && <Badge variant="outline">{materia.nombre}</Badge>}
                  {proyecto && <Badge variant="outline">{proyecto.nombre}</Badge>}
                  {t.fechaLimite && (
                    <span className={vencida ? 'font-medium text-destructive' : ''}>
                      {format(parseISO(t.fechaLimite), "d 'de' MMM", { locale: es })}
                    </span>
                  )}
                  {t.pomodorosCompletados > 0 && <span>🍅 {t.pomodorosCompletados}</span>}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Enfocar con Pomodoro"
                  onClick={() => enfocarTarea(t.id, t.titulo)}
                >
                  <Timer />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEditar(t)}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setAEliminar(t)}>
                  <Trash2 />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <AlertDialog open={aEliminar !== null} onOpenChange={(open) => !open && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{aEliminar?.titulo}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aEliminar) void eliminarTarea(aEliminar.id);
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
