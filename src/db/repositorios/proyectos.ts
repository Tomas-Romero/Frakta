import { db } from '../db';
import type { Proyecto } from '../../types/models';

type DatosProyecto = Omit<Proyecto, 'id'>;

export async function crearProyecto(datos: DatosProyecto): Promise<Proyecto> {
  const proyecto: Proyecto = { ...datos, id: crypto.randomUUID() };
  await db.proyectos.add(proyecto);
  return proyecto;
}

export async function actualizarProyecto(id: string, cambios: Partial<DatosProyecto>): Promise<void> {
  await db.proyectos.update(id, cambios);
}

/** Elimina el proyecto y desvincula (no borra) las tareas que lo referenciaban. */
export async function eliminarProyecto(id: string): Promise<void> {
  await db.transaction('rw', db.proyectos, db.tareas, async () => {
    await db.tareas.where('proyectoId').equals(id).modify({ proyectoId: null });
    await db.proyectos.delete(id);
  });
}
