import { saveAs } from 'file-saver';
import { z } from 'zod';
import { db, SCHEMA_VERSION_ACTUAL, obtenerConfig } from './db';
import { backupCompletoSchema, type BackupCompletoValidado } from './backupSchema';
import type { BackupCompleto } from '../types/models';

// Cada función v -> v+1 transforma el JSON crudo de esa versión a la
// siguiente. Vacío hoy porque SCHEMA_VERSION_ACTUAL es 1 (nada que migrar
// todavía); agregar una entrada acá en cada bump de versión futuro.
// Ver docs/BLUEPRINT.md sección 3.
const migraciones: Record<number, (json: unknown) => unknown> = {};

/**
 * Recibe el JSON crudo de un backup y lo lleva a la forma de la versión
 * actual del esquema, aplicando migraciones incrementales (v1->v2->v3...).
 * No valida contra Zod — eso ocurre después, en importarBackupDesdeArchivo.
 */
export function migrarBackup(json: unknown): unknown {
  if (typeof json !== 'object' || json === null || !('schemaVersion' in json)) {
    throw new Error('El archivo no tiene un campo "schemaVersion" válido.');
  }

  let version = (json as { schemaVersion: unknown }).schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new Error('El campo "schemaVersion" del archivo es inválido.');
  }

  if (version > SCHEMA_VERSION_ACTUAL) {
    throw new Error(
      `Este archivo fue exportado con una versión más nueva (v${version}) que la que soporta la app (v${SCHEMA_VERSION_ACTUAL}). Actualizá la app antes de importarlo.`,
    );
  }

  let resultado: unknown = json;
  while (version < SCHEMA_VERSION_ACTUAL) {
    const migrar = migraciones[version];
    if (!migrar) {
      throw new Error(`Falta la migración de la versión ${version} a ${version + 1}.`);
    }
    resultado = migrar(resultado);
    version += 1;
  }
  return resultado;
}

export async function generarBackup(): Promise<BackupCompleto> {
  const [
    materias,
    bloquesHorario,
    tareas,
    proyectos,
    movimientos,
    suscripciones,
    eventosCompartidos,
    config,
  ] = await Promise.all([
    db.materias.toArray(),
    db.bloquesHorario.toArray(),
    db.tareas.toArray(),
    db.proyectos.toArray(),
    db.movimientos.toArray(),
    db.suscripciones.toArray(),
    db.eventosCompartidos.toArray(),
    obtenerConfig(),
  ]);

  return {
    app: 'organizador-local-first',
    schemaVersion: SCHEMA_VERSION_ACTUAL,
    exportadoEn: new Date().toISOString(),
    datos: {
      materias,
      bloquesHorario,
      tareas,
      proyectos,
      movimientos,
      suscripciones,
      eventosCompartidos,
    },
    config: { tema: config.tema, escalaNotas: config.escalaNotas },
  };
}

export async function exportarBackupComoArchivo(): Promise<void> {
  const backup = await generarBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const fecha = backup.exportadoEn.slice(0, 10);
  saveAs(blob, `backup-organizador-${fecha}.json`);
}

/**
 * Reemplaza todos los datos locales por el contenido del backup. El archivo
 * se valida entero contra Zod antes de tocar Dexie: si falla, se rechaza
 * completo y no se escribe ni una fila (nunca una mezcla parcial).
 */
export async function importarBackupDesdeTexto(jsonTexto: string): Promise<BackupCompletoValidado> {
  let crudo: unknown;
  try {
    crudo = JSON.parse(jsonTexto);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }

  const migrado = migrarBackup(crudo);
  const resultado = backupCompletoSchema.safeParse(migrado);
  if (!resultado.success) {
    throw new Error(`El archivo no tiene el formato esperado:\n${z.prettifyError(resultado.error)}`);
  }
  const backup = resultado.data;

  await db.transaction(
    'rw',
    [
      db.materias,
      db.bloquesHorario,
      db.tareas,
      db.proyectos,
      db.movimientos,
      db.suscripciones,
      db.eventosCompartidos,
      db.config,
    ],
    async () => {
      await Promise.all([
        db.materias.clear(),
        db.bloquesHorario.clear(),
        db.tareas.clear(),
        db.proyectos.clear(),
        db.movimientos.clear(),
        db.suscripciones.clear(),
        db.eventosCompartidos.clear(),
        db.config.clear(),
      ]);

      await Promise.all([
        db.materias.bulkAdd(backup.datos.materias),
        db.bloquesHorario.bulkAdd(backup.datos.bloquesHorario),
        db.tareas.bulkAdd(backup.datos.tareas),
        db.proyectos.bulkAdd(backup.datos.proyectos),
        db.movimientos.bulkAdd(backup.datos.movimientos),
        db.suscripciones.bulkAdd(backup.datos.suscripciones),
        db.eventosCompartidos.bulkAdd(backup.datos.eventosCompartidos),
        db.config.add({ id: 'app', ...backup.config }),
      ]);
    },
  );

  return backup;
}
