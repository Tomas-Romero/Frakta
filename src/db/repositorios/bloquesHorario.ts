import { db } from '../db';
import type { BloqueHorario } from '../../types/models';

type DatosBloque = Omit<BloqueHorario, 'id'>;

export async function crearBloque(datos: DatosBloque): Promise<BloqueHorario> {
  const bloque: BloqueHorario = { ...datos, id: crypto.randomUUID() };
  await db.bloquesHorario.add(bloque);
  return bloque;
}

export async function actualizarBloque(
  id: string,
  cambios: Partial<DatosBloque>,
): Promise<void> {
  await db.bloquesHorario.update(id, cambios);
}

export async function eliminarBloque(id: string): Promise<void> {
  await db.bloquesHorario.delete(id);
}
