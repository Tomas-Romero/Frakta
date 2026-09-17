import {
  Dumbbell,
  Bike,
  HeartPulse,
  Flame,
  Zap,
  Trophy,
  Timer,
  Activity,
  Footprints,
  Waves,
  StretchHorizontal,
  Medal,
  Target,
} from 'lucide-react';

// Íconos disponibles para ejercicios de Hábitos (planificados en una Rutina
// o logueados en un Registro). Curado a propósito — mismo criterio que
// src/features/horario/iconosActividad.ts y src/features/calendario/iconosFecha.ts.
export const ICONOS_FITNESS = {
  Dumbbell,
  Bike,
  HeartPulse,
  Flame,
  Zap,
  Trophy,
  Timer,
  Activity,
  Footprints,
  Waves,
  StretchHorizontal,
  Medal,
  Target,
} as const;

export type NombreIconoFitness = keyof typeof ICONOS_FITNESS;

export const NOMBRES_ICONOS_FITNESS = Object.keys(ICONOS_FITNESS) as NombreIconoFitness[];

export function esIconoFitnessValido(nombre: string): nombre is NombreIconoFitness {
  return nombre in ICONOS_FITNESS;
}
