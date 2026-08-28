import { db } from '../db';
import type { EstadoTarea, Tarea } from '../../types/models';

type DatosTarea = Omit<Tarea, 'id' | 'pomodorosCompletados'>;

export async function crearTarea(datos: DatosTarea): Promise<Tarea> {
  const tarea: Tarea = { ...datos, id: crypto.randomUUID(), pomodorosCompletados: 0 };
  await db.tareas.add(tarea);
  return tarea;
}

export async function actualizarTarea(id: string, cambios: Partial<DatosTarea>): Promise<void> {
  await db.tareas.update(id, cambios);
}

export async function cambiarEstadoTarea(id: string, estado: EstadoTarea): Promise<void> {
  await db.tareas.update(id, { estado });
}

export async function eliminarTarea(id: string): Promise<void> {
  await db.tareas.delete(id);
}

export async function incrementarPomodoro(id: string): Promise<void> {
  const tarea = await db.tareas.get(id);
  if (!tarea) return;
  await db.tareas.update(id, { pomodorosCompletados: tarea.pomodorosCompletados + 1 });
}
