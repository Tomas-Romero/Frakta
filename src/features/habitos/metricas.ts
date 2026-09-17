import { startOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroEjercicio } from '@/types/models';

// Funciones puras de agregación para los reportes de Hábitos — mismo
// criterio que src/features/finanzas/metricas.ts: no dibujan nada, solo dan
// forma a los datos para que el componente de reportes los grafique.

export function nombresEjerciciosFuerza(registros: RegistroEjercicio[]): string[] {
  const nombres = registros
    .filter((r) => r.tipo === 'fuerza' && r.nombreEjercicio)
    .map((r) => r.nombreEjercicio as string);
  return [...new Set(nombres)].sort();
}

function pesoMaximoDeSesion(registro: RegistroEjercicio): number {
  return (registro.seriesRealizadas ?? []).reduce((max, s) => Math.max(max, s.pesoKg), 0);
}

export interface PuntoProgresoEjercicio {
  fecha: string;
  pesoMaximo: number;
}

/** Peso máximo levantado en cada sesión de `nombreEjercicio`, ordenado por fecha. */
export function progresoPesoMaximo(
  registros: RegistroEjercicio[],
  nombreEjercicio: string,
): PuntoProgresoEjercicio[] {
  return registros
    .filter((r) => r.tipo === 'fuerza' && r.nombreEjercicio === nombreEjercicio)
    .map((r) => ({ fecha: r.fecha, pesoMaximo: pesoMaximoDeSesion(r) }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export interface RecordPersonal {
  pesoKg: number;
  fecha: string;
}

/** Récord histórico (peso máximo) para un ejercicio puntual, o null si nunca se cargó. */
export function recordPersonal(
  registros: RegistroEjercicio[],
  nombreEjercicio: string,
): RecordPersonal | null {
  const puntos = progresoPesoMaximo(registros, nombreEjercicio);
  if (puntos.length === 0) return null;
  return puntos.reduce((mejor, p) => (p.pesoMaximo > mejor.pesoKg ? { pesoKg: p.pesoMaximo, fecha: p.fecha } : mejor), {
    pesoKg: puntos[0].pesoMaximo,
    fecha: puntos[0].fecha,
  });
}

/** Récord histórico de cada ejercicio de fuerza registrado — para el badge "PR" de la lista. */
export function prPorEjercicio(registros: RegistroEjercicio[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const r of registros) {
    if (r.tipo !== 'fuerza' || !r.nombreEjercicio) continue;
    const maximo = pesoMaximoDeSesion(r);
    const actual = mapa.get(r.nombreEjercicio) ?? 0;
    if (maximo > actual) mapa.set(r.nombreEjercicio, maximo);
  }
  return mapa;
}

export interface VolumenSemana {
  semana: string;
  sesiones: number;
  volumenKg: number;
}

/**
 * Constancia de entrenamiento por semana: `sesiones` cuenta cualquier tipo
 * de registro (indicador general), `volumenKg` (Σ reps×peso) solo suma las
 * sesiones de fuerza, únicas con datos de peso.
 */
export function volumenPorSemana(registros: RegistroEjercicio[], semanas = 8): VolumenSemana[] {
  const porSemana = new Map<string, { inicio: Date; sesiones: number; volumenKg: number }>();

  for (const r of registros) {
    const inicioSemana = startOfWeek(new Date(r.fecha), { weekStartsOn: 1 });
    const clave = format(inicioSemana, 'yyyy-MM-dd');
    const actual = porSemana.get(clave) ?? { inicio: inicioSemana, sesiones: 0, volumenKg: 0 };
    actual.sesiones += 1;
    if (r.tipo === 'fuerza') {
      actual.volumenKg += (r.seriesRealizadas ?? []).reduce(
        (acc, s) => acc + s.repeticiones * s.pesoKg,
        0,
      );
    }
    porSemana.set(clave, actual);
  }

  return [...porSemana.values()]
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
    .slice(-semanas)
    .map(({ inicio, sesiones, volumenKg }) => ({
      semana: format(inicio, 'd MMM', { locale: es }),
      sesiones,
      volumenKg: Math.round(volumenKg),
    }));
}
