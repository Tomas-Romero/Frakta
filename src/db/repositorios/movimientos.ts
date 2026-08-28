import { db } from '../db';
import type { MovimientoFinanciero } from '../../types/models';

type DatosMovimiento = Omit<MovimientoFinanciero, 'id'>;

export async function crearMovimiento(datos: DatosMovimiento): Promise<MovimientoFinanciero> {
  const movimiento: MovimientoFinanciero = { ...datos, id: crypto.randomUUID() };
  await db.movimientos.add(movimiento);
  return movimiento;
}

export async function actualizarMovimiento(
  id: string,
  cambios: Partial<DatosMovimiento>,
): Promise<void> {
  await db.movimientos.update(id, cambios);
}

export async function eliminarMovimiento(id: string): Promise<void> {
  await db.movimientos.delete(id);
}
