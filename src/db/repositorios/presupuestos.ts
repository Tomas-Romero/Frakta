import { db } from '../db';

export async function fijarPresupuesto(categoria: string, montoMensual: number): Promise<void> {
  if (montoMensual <= 0) {
    await db.presupuestos.delete(categoria);
    return;
  }
  await db.presupuestos.put({ categoria, montoMensual });
}

export async function eliminarPresupuesto(categoria: string): Promise<void> {
  await db.presupuestos.delete(categoria);
}
