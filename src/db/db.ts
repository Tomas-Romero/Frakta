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
  Rutina,
  RegistroEjercicio,
  RegistroNutricion,
  FechaImportante,
} from '../types/models';

export const SCHEMA_VERSION_ACTUAL = 4;

export interface ConfigApp {
  id: 'app';
  tema: 'auto' | 'claro' | 'oscuro';
  // Eje independiente de `tema`: cada paleta define su propio par claro/oscuro
  // (ver src/index.css), así que elegir una paleta nunca rompe la garantía de
  // "auto respeta el sistema". El isotipo de marca (verde/dorado) no cambia
  // entre paletas — ver docs/BLUEPRINT.md sección 9.
  paleta: 'default' | 'oceano' | 'lila' | 'minimalista';
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
  rutinas!: EntityTable<Rutina, 'id'>;
  registrosEjercicio!: EntityTable<RegistroEjercicio, 'id'>;
  registrosNutricion!: EntityTable<RegistroNutricion, 'fecha'>;
  fechasImportantes!: EntityTable<FechaImportante, 'id'>;
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
    this.version(2).stores({
      presupuestos: 'categoria',
    });

    // v3: agrega el módulo de Hábitos y Entrenamiento (BLUEPRINT.md sección 7).
    this.version(3).stores({
      rutinas: 'id, activa',
      registrosEjercicio: 'id, fecha, tipo',
      registrosNutricion: 'fecha',
    });

    // v4: agrega Calendario de fechas importantes y convierte RegistroEjercicio
    // (tipo 'fuerza') de una sola serie/repeticiones/peso a un array de sets
    // reales, cada uno con su propio peso/reps (BLUEPRINT.md secciones 10 y 11).
    // `registrosEjercicio` no cambia sus índices (id, fecha, tipo), solo el
    // contenido no indexado — por eso no se re-declara en `.stores()`, solo
    // se transforma en `.upgrade()`. Primera migración de datos en vivo del
    // proyecto: hasta acá, cada bump solo agregaba tablas nuevas vacías.
    this.version(SCHEMA_VERSION_ACTUAL)
      .stores({
        fechasImportantes: 'id, tipoRecurrencia',
      })
      .upgrade(async (tx) => {
        await tx
          .table('registrosEjercicio')
          .toCollection()
          .modify((registro) => {
            const esFuerza = registro.tipo === 'fuerza';
            const series = typeof registro.series === 'number' ? registro.series : 0;
            const repeticiones =
              typeof registro.repeticiones === 'number' ? registro.repeticiones : 0;
            const pesoKg = typeof registro.pesoKg === 'number' ? registro.pesoKg : 0;

            registro.seriesRealizadas = esFuerza
              ? Array.from({ length: Math.max(series, 1) }, () => ({ repeticiones, pesoKg }))
              : null;
            if (registro.icono === undefined) registro.icono = null;

            delete registro.series;
            delete registro.repeticiones;
            delete registro.pesoKg;
          });
      });
  }
}

export const db = new OrganizadorDB();

const CONFIG_POR_DEFECTO: ConfigApp = {
  id: 'app',
  tema: 'auto',
  paleta: 'default',
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
