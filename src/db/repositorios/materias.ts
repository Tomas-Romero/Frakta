import { db } from '../db';
import type { Materia } from '../../types/models';

type DatosMateria = Omit<Materia, 'id' | 'creadoEn' | 'actualizadoEn'>;

export async function crearMateria(datos: DatosMateria): Promise<Materia> {
  const ahora = new Date().toISOString();
  const materia: Materia = {
    ...datos,
    id: crypto.randomUUID(),
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
  await db.materias.add(materia);
  return materia;
}

export async function actualizarMateria(
  id: string,
  cambios: Partial<DatosMateria>,
): Promise<void> {
  await db.materias.update(id, { ...cambios, actualizadoEn: new Date().toISOString() });
}

/**
 * Elimina la materia y, en cascada, sus bloques de horario — evita bloques
 * huérfanos apuntando a una materia inexistente.
 */
export async function eliminarMateria(id: string): Promise<void> {
  await db.transaction('rw', db.materias, db.bloquesHorario, async () => {
    await db.bloquesHorario.where('materiaId').equals(id).delete();
    await db.materias.delete(id);
  });
}
