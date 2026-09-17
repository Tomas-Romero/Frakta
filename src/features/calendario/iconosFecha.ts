import {
  CalendarHeart,
  Cake,
  PartyPopper,
  GraduationCap,
  Star,
  Gift,
  Award,
  Ribbon,
  Medal,
  Trophy,
  Sparkles,
  Landmark,
} from 'lucide-react';

// Íconos disponibles para fechas importantes (exámenes, cumpleaños,
// aniversarios, días especiales). Curado a propósito, no es un selector
// libre — mismo criterio que src/features/horario/iconosActividad.ts.
export const ICONOS_FECHA = {
  CalendarHeart,
  Cake,
  PartyPopper,
  GraduationCap,
  Star,
  Gift,
  Award,
  Ribbon,
  Medal,
  Trophy,
  Sparkles,
  Landmark,
} as const;

export type NombreIconoFecha = keyof typeof ICONOS_FECHA;

export const NOMBRES_ICONOS_FECHA = Object.keys(ICONOS_FECHA) as NombreIconoFecha[];

export function esIconoFechaValido(nombre: string): nombre is NombreIconoFecha {
  return nombre in ICONOS_FECHA;
}
