import { db } from '../db';
import type { FechaImportante } from '../../types/models';

type DatosFechaImportante = Omit<FechaImportante, 'id'>;

export async function crearFechaImportante(datos: DatosFechaImportante): Promise<FechaImportante> {
  const fecha: FechaImportante = { ...datos, id: crypto.randomUUID() };
  await db.fechasImportantes.add(fecha);
  return fecha;
}

export async function actualizarFechaImportante(
  id: string,
  cambios: Partial<DatosFechaImportante>,
): Promise<void> {
  await db.fechasImportantes.update(id, cambios);
}

export async function eliminarFechaImportante(id: string): Promise<void> {
  await db.fechasImportantes.delete(id);
}
