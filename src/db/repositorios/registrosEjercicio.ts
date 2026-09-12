import { db } from '../db';
import type { RegistroEjercicio } from '../../types/models';

type DatosRegistroEjercicio = Omit<RegistroEjercicio, 'id'>;

export async function crearRegistroEjercicio(datos: DatosRegistroEjercicio): Promise<RegistroEjercicio> {
  const registro: RegistroEjercicio = { ...datos, id: crypto.randomUUID() };
  await db.registrosEjercicio.add(registro);
  return registro;
}

export async function actualizarRegistroEjercicio(
  id: string,
  cambios: Partial<DatosRegistroEjercicio>,
): Promise<void> {
  await db.registrosEjercicio.update(id, cambios);
}

export async function eliminarRegistroEjercicio(id: string): Promise<void> {
  await db.registrosEjercicio.delete(id);
}
