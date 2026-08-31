import { z } from 'zod';

// Espejo Zod de src/types/models.ts — usado para validar todo import (JSON
// completo, CSV o XLSX) antes de escribir una sola fila en Dexie.
// Ver docs/BLUEPRINT.md sección 3.

const estadoMateriaSchema = z.enum(['PorCursar', 'Cursando', 'Regular', 'Aprobado']);

const parcialSchema = z.object({
  nombre: z.string(),
  nota: z.number().nullable(),
  peso: z.number().min(0).max(1),
});

const materiaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  anioCursado: z.number(),
  cargaHoraria: z.object({ semanal: z.number(), total: z.number() }),
  estado: estadoMateriaSchema,
  nota: z.number().nullable(),
  parciales: z.array(parcialSchema),
  pesoFinal: z.number().min(0).max(1),
  correlativas: z.array(z.string()),
  creadoEn: z.string(),
  actualizadoEn: z.string(),
});

const diaSemanaSchema = z.enum([
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
]);

const bloqueHorarioSchema = z.object({
  id: z.string(),
  materiaId: z.string().nullable(),
  titulo: z.string().nullable().default(null),
  icono: z.string().nullable().default(null),
  dia: diaSemanaSchema,
  horaInicioMin: z.number().min(0).max(1440),
  horaFinMin: z.number().min(0).max(1440),
  aula: z.string().optional(),
  color: z.string(),
});

const tipoTareaSchema = z.enum(['academica', 'personal', 'proyecto', 'idea']);
const estadoTareaSchema = z.enum(['por_hacer', 'en_progreso', 'completado']);
const prioridadSchema = z.enum(['alta', 'media', 'baja']);

const tareaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  tipo: tipoTareaSchema,
  proyectoId: z.string().nullable(),
  estado: estadoTareaSchema,
  prioridad: prioridadSchema,
  fechaLimite: z.string().nullable(),
  materiaId: z.string().nullable(),
  pomodorosCompletados: z.number().int().min(0),
});

const proyectoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
});

const tipoMovimientoSchema = z.enum(['gasto', 'ingreso']);

const movimientoFinancieroSchema = z.object({
  id: z.string(),
  tipo: tipoMovimientoSchema,
  monto: z.number(),
  categoria: z.string(),
  fecha: z.string(),
  descripcion: z.string(),
});

const suscripcionRecurrenteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  monto: z.number(),
  diaDelMes: z.number().int().min(1).max(31),
  categoria: z.string(),
  activa: z.boolean(),
});

const presupuestoSchema = z.object({
  categoria: z.string().min(1),
  montoMensual: z.number().min(0),
});

const participanteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});

const gastoItemSchema = z.object({
  id: z.string(),
  descripcion: z.string(),
  monto: z.number(),
  pagadoPor: z.array(z.string()),
  participantes: z.array(z.string()),
});

const eventoCompartidoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  participantes: z.array(participanteSchema),
  gastos: z.array(gastoItemSchema),
});

export const backupCompletoSchema = z.object({
  app: z.literal('organizador-local-first'),
  schemaVersion: z.number().int().positive(),
  exportadoEn: z.string(),
  datos: z.object({
    materias: z.array(materiaSchema),
    bloquesHorario: z.array(bloqueHorarioSchema),
    tareas: z.array(tareaSchema),
    proyectos: z.array(proyectoSchema),
    movimientos: z.array(movimientoFinancieroSchema),
    suscripciones: z.array(suscripcionRecurrenteSchema),
    presupuestos: z.array(presupuestoSchema),
    eventosCompartidos: z.array(eventoCompartidoSchema),
  }),
  config: z.object({
    tema: z.enum(['auto', 'claro', 'oscuro']),
    escalaNotas: z.enum(['1-10', '0-100']),
    recordatoriosActivos: z.boolean().default(true),
    almacenamientoPersistenteActivo: z.boolean().default(true),
  }),
});

export type BackupCompletoValidado = z.infer<typeof backupCompletoSchema>;
