// Tipos de dominio del organizador local-first.
// Fuente de verdad: ../../docs/BLUEPRINT.md sección 3.
// Extender estos tipos cuando haga falta; no redefinirlos en otro archivo.

// ---------- Académico ----------

export type EstadoMateria = 'PorCursar' | 'Cursando' | 'Regular' | 'Aprobado';

export interface Parcial {
  nombre: string;
  nota: number | null;
  peso: number; // 0..1
}

export interface Materia {
  id: string;
  nombre: string;
  anioCursado: number;
  cargaHoraria: { semanal: number; total: number };
  estado: EstadoMateria;
  nota: number | null;
  parciales: Parcial[];
  pesoFinal: number; // 0..1 — peso del final sobre la nota, ver BLUEPRINT.md sección 5
  correlativas: string[]; // ids de Materia
  creadoEn: string; // ISO 8601
  actualizadoEn: string; // ISO 8601
}

// ---------- Horario ----------
// Nunca agregar un flag de "celda fusionada" acá — la fusión se calcula en el
// render a partir de horaInicioMin/horaFinMin. Ver BLUEPRINT.md sección 2.2.

export type DiaSemana =
  | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface BloqueHorario {
  id: string;
  materiaId: string;
  dia: DiaSemana;
  horaInicioMin: number; // minutos desde 00:00 (ej. 540 = 09:00)
  horaFinMin: number;
  aula?: string;
  color: string; // hex, ej. "#2c4a9e"
}

// ---------- Tareas y proyectos ----------

export type TipoTarea = 'academica' | 'personal' | 'proyecto' | 'idea';
export type EstadoTarea = 'por_hacer' | 'en_progreso' | 'completado';
export type Prioridad = 'alta' | 'media' | 'baja';

export interface Tarea {
  id: string;
  titulo: string;
  tipo: TipoTarea;
  proyectoId: string | null;
  estado: EstadoTarea;
  prioridad: Prioridad;
  fechaLimite: string | null; // ISO date (YYYY-MM-DD)
  materiaId: string | null;
  pomodorosCompletados: number;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
}

// ---------- Finanzas ----------

export type TipoMovimiento = 'gasto' | 'ingreso';

export interface MovimientoFinanciero {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  categoria: string; // Alimentación, Transporte, Ocio, Servicios, ...
  fecha: string; // ISO date
  descripcion: string;
}

export interface SuscripcionRecurrente {
  id: string;
  nombre: string;
  monto: number;
  diaDelMes: number; // 1..31
  categoria: string;
  activa: boolean;
}

/** Presupuesto mensual por categoría, para el reporte "presupuesto vs. real". */
export interface Presupuesto {
  categoria: string; // clave primaria — un presupuesto por categoría
  montoMensual: number;
}

// ---------- Gastos compartidos ----------
// Cada GastoItem lleva su propia lista de participantes: la exclusión por
// ítem (alguien no consume alcohol, es celíaco, etc.) es simplemente no
// incluirlo ahí. Ver BLUEPRINT.md sección 2.3.

export interface Participante {
  id: string;
  nombre: string;
}

export interface GastoItem {
  id: string;
  descripcion: string;
  monto: number;
  pagadoPor: string[]; // ids de Participante que adelantaron el pago
  participantes: string[]; // ids de Participante que comparten este gasto
}

export interface EventoCompartido {
  id: string;
  nombre: string;
  participantes: Participante[];
  gastos: GastoItem[];
}

/** Resultado del algoritmo de liquidación — ver BLUEPRINT.md sección 2.3. */
export interface Transferencia {
  de: string; // id de Participante que paga
  a: string;  // id de Participante que recibe
  monto: number;
}

// ---------- Respaldo global (import/export) ----------

export interface BackupCompleto {
  app: 'organizador-local-first';
  schemaVersion: number;
  exportadoEn: string; // ISO 8601
  datos: {
    materias: Materia[];
    bloquesHorario: BloqueHorario[];
    tareas: Tarea[];
    proyectos: Proyecto[];
    movimientos: MovimientoFinanciero[];
    suscripciones: SuscripcionRecurrente[];
    presupuestos: Presupuesto[];
    eventosCompartidos: EventoCompartido[];
  };
  config: {
    tema: 'auto' | 'claro' | 'oscuro';
    escalaNotas: '1-10' | '0-100';
  };
}
