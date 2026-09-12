import { db } from '../db';
import type { RegistroNutricion } from '../../types/models';

const REGISTRO_POR_DEFECTO: Omit<RegistroNutricion, 'fecha'> = {
  proteinaObjetivoG: 0,
  proteinaLogradaG: 0,
  creatinaTomada: false,
};

export async function obtenerRegistroNutricion(fecha: string): Promise<RegistroNutricion | undefined> {
  return db.registrosNutricion.get(fecha);
}

export async function obtenerUltimoRegistroNutricion(): Promise<RegistroNutricion | undefined> {
  return db.registrosNutricion.orderBy('fecha').last();
}

/**
 * Lectura + escritura en una transacción: el checkbox de creatina y los
 * gramos de proteína se editan por separado y no deben pisarse entre sí —
 * mismo patrón que actualizarConfig en db.ts.
 */
export async function actualizarRegistroNutricion(
  fecha: string,
  cambios: Partial<Omit<RegistroNutricion, 'fecha'>>,
): Promise<void> {
  await db.transaction('rw', db.registrosNutricion, async () => {
    const actual = await db.registrosNutricion.get(fecha);
    await db.registrosNutricion.put({ fecha, ...REGISTRO_POR_DEFECTO, ...actual, ...cambios });
  });
}
