import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/db/db';
import { ListaTareas } from './ListaTareas';
import { KanbanTareas } from './KanbanTareas';
import { TareaForm } from './TareaForm';
import { ProyectosList } from './ProyectosList';
import { ProyectoForm } from './ProyectoForm';
import type { Proyecto, Tarea } from '@/types/models';

export function Tareas() {
  const tareas = useLiveQuery(() => db.tareas.toArray(), [], []);
  const proyectos = useLiveQuery(() => db.proyectos.toArray(), [], []);
  const materias = useLiveQuery(() => db.materias.toArray(), [], []);
  const [vista, setVista] = useState<'lista' | 'kanban' | 'proyectos'>('lista');
  const [formAbierto, setFormAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Tarea | undefined>(undefined);
  const [formProyectoAbierto, setFormProyectoAbierto] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | undefined>(undefined);

  if (!tareas || !proyectos || !materias) return null;

  const proyectosPorId = new Map(proyectos.map((p) => [p.id, p]));
  const materiasPorId = new Map(materias.map((m) => [m.id, m]));

  function abrirNueva() {
    setTareaEditando(undefined);
    setFormAbierto(true);
  }

  function abrirEdicion(tarea: Tarea) {
    setTareaEditando(tarea);
    setFormAbierto(true);
  }

  function abrirNuevoProyecto() {
    setProyectoEditando(undefined);
    setFormProyectoAbierto(true);
  }

  function abrirEdicionProyecto(proyecto: Proyecto) {
    setProyectoEditando(proyecto);
    setFormProyectoAbierto(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={vista} onValueChange={(v) => setVista(v as typeof vista)}>
          <TabsList>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          </TabsList>
        </Tabs>
        {vista === 'proyectos' ? (
          <Button onClick={abrirNuevoProyecto}>
            <Plus /> Nuevo proyecto
          </Button>
        ) : (
          <Button onClick={abrirNueva}>
            <Plus /> Nueva tarea
          </Button>
        )}
      </div>

      {vista === 'lista' && (
        <ListaTareas
          tareas={tareas}
          proyectosPorId={proyectosPorId}
          materiasPorId={materiasPorId}
          onEditar={abrirEdicion}
        />
      )}
      {vista === 'kanban' && (
        <KanbanTareas
          tareas={tareas}
          proyectosPorId={proyectosPorId}
          materiasPorId={materiasPorId}
          onEditar={abrirEdicion}
        />
      )}
      {vista === 'proyectos' && (
        <ProyectosList proyectos={proyectos} tareas={tareas} onEditar={abrirEdicionProyecto} />
      )}

      <TareaForm
        open={formAbierto}
        onOpenChange={setFormAbierto}
        tarea={tareaEditando}
        proyectos={proyectos}
        materias={materias}
      />

      <ProyectoForm
        open={formProyectoAbierto}
        onOpenChange={setFormProyectoAbierto}
        proyecto={proyectoEditando}
      />
    </div>
  );
}
