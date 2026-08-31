import Dexie, { type EntityTable } from 'dexie';
import type {
  Materia,
  BloqueHorario,
  Tarea,
  Proyecto,
  MovimientoFinanciero,
  SuscripcionRecurrente,
  Presupuesto,
  EventoCompartido,
} from '../types/models';

export const SCHEMA_VERSION_ACTUAL = 2;

export interface ConfigApp {
  id: 'app';
  tema: 'auto' | 'claro' | 'oscuro';
  escalaNotas: '1-10' | '0-100';
  recordatoriosActivos: boolean;
  almacenamientoPersistenteActivo: boolean;
}

export class OrganizadorDB extends Dexie {
  materias!: EntityTable<Materia, 'id'>;
  bloquesHorario!: EntityTable<BloqueHorario, 'id'>;
  tareas!: EntityTable<Tarea, 'id'>;
  proyectos!: EntityTable<Proyecto, 'id'>;
  movimientos!: EntityTable<MovimientoFinanciero, 'id'>;
  suscripciones!: EntityTable<SuscripcionRecurrente, 'id'>;
  presupuestos!: EntityTable<Presupuesto, 'categoria'>;
  eventosCompartidos!: EntityTable<EventoCompartido, 'id'>;
  config!: EntityTable<ConfigApp, 'id'>;

  constructor() {
    super('organizador-local-first');

    this.version(1).stores({
      materias: 'id, anioCursado, estado',
      bloquesHorario: 'id, materiaId, dia',
      tareas: 'id, estado, prioridad, fechaLimite, materiaId, proyectoId',
      proyectos: 'id',
      movimientos: 'id, tipo, categoria, fecha',
      suscripciones: 'id, activa, diaDelMes',
      eventosCompartidos: 'id',
      config: 'id',
    });

    // v2: agrega presupuestos por categoría (BLUEPRINT.md sección 5 — Fase 3).
    this.version(SCHEMA_VERSION_ACTUAL).stores({
      presupuestos: 'categoria',
    });
  }
}

export const db = new OrganizadorDB();

const CONFIG_POR_DEFECTO: ConfigApp = {
  id: 'app',
  tema: 'auto',
  escalaNotas: '1-10',
  recordatoriosActivos: true,
  almacenamientoPersistenteActivo: true,
};

export async function obtenerConfig(): Promise<ConfigApp> {
  const config = await db.config.get('app');
  return config ? { ...CONFIG_POR_DEFECTO, ...config } : CONFIG_POR_DEFECTO;
}

/**
 * Lectura + escritura envuelta en una transacción: dos llamadas concurrentes
 * (ej. togglear dos switches casi al mismo tiempo) no deben pisarse una a la
 * otra — sin la transacción, ambas leen el mismo estado viejo y la última en
 * escribir gana, perdiendo el cambio de la otra.
 */
export async function actualizarConfig(cambios: Partial<Omit<ConfigApp, 'id'>>): Promise<void> {
  await db.transaction('rw', db.config, async () => {
    const actual = await db.config.get('app');
    await db.config.put({ ...CONFIG_POR_DEFECTO, ...actual, ...cambios });
  });
}
