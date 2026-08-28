import Dexie, { type EntityTable } from 'dexie';
import type {
  Materia,
  BloqueHorario,
  Tarea,
  Proyecto,
  MovimientoFinanciero,
  SuscripcionRecurrente,
  EventoCompartido,
} from '../types/models';

export const SCHEMA_VERSION_ACTUAL = 1;

export interface ConfigApp {
  id: 'app';
  tema: 'auto' | 'claro' | 'oscuro';
  escalaNotas: '1-10' | '0-100';
}

export class OrganizadorDB extends Dexie {
  materias!: EntityTable<Materia, 'id'>;
  bloquesHorario!: EntityTable<BloqueHorario, 'id'>;
  tareas!: EntityTable<Tarea, 'id'>;
  proyectos!: EntityTable<Proyecto, 'id'>;
  movimientos!: EntityTable<MovimientoFinanciero, 'id'>;
  suscripciones!: EntityTable<SuscripcionRecurrente, 'id'>;
  eventosCompartidos!: EntityTable<EventoCompartido, 'id'>;
  config!: EntityTable<ConfigApp, 'id'>;

  constructor() {
    super('organizador-local-first');

    this.version(SCHEMA_VERSION_ACTUAL).stores({
      materias: 'id, anioCursado, estado',
      bloquesHorario: 'id, materiaId, dia',
      tareas: 'id, estado, prioridad, fechaLimite, materiaId, proyectoId',
      proyectos: 'id',
      movimientos: 'id, tipo, categoria, fecha',
      suscripciones: 'id, activa, diaDelMes',
      eventosCompartidos: 'id',
      config: 'id',
    });
  }
}

export const db = new OrganizadorDB();

export async function obtenerConfig(): Promise<ConfigApp> {
  const config = await db.config.get('app');
  return config ?? { id: 'app', tema: 'auto', escalaNotas: '1-10' };
}
