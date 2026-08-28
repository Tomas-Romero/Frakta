import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Pencil, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cambiarEstadoTarea } from '@/db/repositorios/tareas';
import { usePomodoroStore } from '@/store/pomodoroStore';
import type { EstadoTarea, Materia, Prioridad, Proyecto, Tarea } from '@/types/models';

const COLUMNAS: { estado: EstadoTarea; etiqueta: string }[] = [
  { estado: 'por_hacer', etiqueta: 'Por hacer' },
  { estado: 'en_progreso', etiqueta: 'En progreso' },
  { estado: 'completado', etiqueta: 'Completado' },
];

const COLOR_PRIORIDAD: Record<Prioridad, string> = {
  alta: 'bg-red-600/15 text-red-700 dark:text-red-400',
  media: 'bg-amber-600/15 text-amber-700 dark:text-amber-400',
  baja: 'bg-muted text-muted-foreground',
};

interface KanbanTareasProps {
  tareas: Tarea[];
  proyectosPorId: Map<string, Proyecto>;
  materiasPorId: Map<string, Materia>;
  onEditar: (tarea: Tarea) => void;
}

export function KanbanTareas({ tareas, proyectosPorId, materiasPorId, onEditar }: KanbanTareasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const nuevoEstado = over.id as EstadoTarea;
    const tarea = tareas.find((t) => t.id === active.id);
    if (tarea && tarea.estado !== nuevoEstado) {
      void cambiarEstadoTarea(tarea.id, nuevoEstado);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNAS.map(({ estado, etiqueta }) => (
          <ColumnaKanban
            key={estado}
            estado={estado}
            etiqueta={etiqueta}
            tareas={tareas.filter((t) => t.estado === estado)}
            proyectosPorId={proyectosPorId}
            materiasPorId={materiasPorId}
            onEditar={onEditar}
          />
        ))}
      </div>
    </DndContext>
  );
}

function ColumnaKanban({
  estado,
  etiqueta,
  tareas,
  proyectosPorId,
  materiasPorId,
  onEditar,
}: {
  estado: EstadoTarea;
  etiqueta: string;
  tareas: Tarea[];
  proyectosPorId: Map<string, Proyecto>;
  materiasPorId: Map<string, Materia>;
  onEditar: (tarea: Tarea) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-40 flex-col gap-2 rounded-lg border p-2 ${isOver ? 'bg-accent/50' : 'bg-muted/30'}`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{etiqueta}</h3>
        <span className="text-xs text-muted-foreground">{tareas.length}</span>
      </div>
      {tareas.map((t) => (
        <TarjetaKanban
          key={t.id}
          tarea={t}
          proyecto={t.proyectoId ? proyectosPorId.get(t.proyectoId) : undefined}
          materia={t.materiaId ? materiasPorId.get(t.materiaId) : undefined}
          onEditar={onEditar}
        />
      ))}
    </div>
  );
}

function TarjetaKanban({
  tarea,
  proyecto,
  materia,
  onEditar,
}: {
  tarea: Tarea;
  proyecto?: Proyecto;
  materia?: Materia;
  onEditar: (tarea: Tarea) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tarea.id,
  });
  const enfocarTarea = usePomodoroStore((s) => s.enfocarTarea);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="cursor-grab touch-none rounded-md border bg-card p-2.5 text-sm shadow-sm active:cursor-grabbing"
    >
      <p className="font-medium">{tarea.titulo}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <Badge variant="secondary" className={COLOR_PRIORIDAD[tarea.prioridad]}>
          {tarea.prioridad}
        </Badge>
        {materia && <Badge variant="outline">{materia.nombre}</Badge>}
        {proyecto && <Badge variant="outline">{proyecto.nombre}</Badge>}
      </div>
      <div className="mt-1.5 flex justify-end gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => enfocarTarea(tarea.id, tarea.titulo)}
        >
          <Timer />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEditar(tarea)}
        >
          <Pencil />
        </Button>
      </div>
    </div>
  );
}
