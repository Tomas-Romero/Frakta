import { db } from '../db';
import type { SuscripcionRecurrente } from '../../types/models';

type DatosSuscripcion = Omit<SuscripcionRecurrente, 'id'>;

export async function crearSuscripcion(datos: DatosSuscripcion): Promise<SuscripcionRecurrente> {
  const suscripcion: SuscripcionRecurrente = { ...datos, id: crypto.randomUUID() };
  await db.suscripciones.add(suscripcion);
  return suscripcion;
}

export async function actualizarSuscripcion(
  id: string,
  cambios: Partial<DatosSuscripcion>,
): Promise<void> {
  await db.suscripciones.update(id, cambios);
}

export async function eliminarSuscripcion(id: string): Promise<void> {
  await db.suscripciones.delete(id);
}
