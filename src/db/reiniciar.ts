import { db } from './db';

/**
 * Borra absolutamente todos los datos locales (todas las tablas, incluida
 * `config`). Es la única operación de la app sin ningún tipo de deshacer —
 * la UI debe pedir confirmación fuerte antes de llamar a esto.
 */
export async function reiniciarTodosLosDatos(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((tabla) => tabla.clear()));
  });
}
