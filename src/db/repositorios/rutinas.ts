import { db } from '../db';
import type { Rutina } from '../../types/models';

type DatosRutina = Omit<Rutina, 'id' | 'creadoEn' | 'actualizadoEn'>;

export async function crearRutina(datos: DatosRutina): Promise<Rutina> {
  const ahora = new Date().toISOString();
  const rutina: Rutina = { ...datos, id: crypto.randomUUID(), creadoEn: ahora, actualizadoEn: ahora };
  await db.rutinas.add(rutina);
  return rutina;
}

export async function actualizarRutina(id: string, cambios: Partial<DatosRutina>): Promise<void> {
  await db.rutinas.update(id, { ...cambios, actualizadoEn: new Date().toISOString() });
}

export async function eliminarRutina(id: string): Promise<void> {
  await db.rutinas.delete(id);
}

/**
 * Solo puede haber una rutina activa a la vez — apagar las demás y prender la
 * elegida tiene que ser una sola operación atómica, nunca N updates sueltos
 * (mismo motivo que actualizarConfig en db.ts).
 */
export async function activarRutina(id: string): Promise<void> {
  await db.transaction('rw', db.rutinas, async () => {
    const todas = await db.rutinas.toArray();
    await Promise.all(todas.map((r) => db.rutinas.update(r.id, { activa: r.id === id })));
  });
}
