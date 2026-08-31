import {
  Dumbbell,
  Bike,
  BookOpen,
  Briefcase,
  Coffee,
  Music,
  UtensilsCrossed,
  Palette,
  Code2,
  Users,
  Car,
  ShoppingCart,
  Heart,
  Plane,
  Gamepad2,
  Stethoscope,
} from 'lucide-react';

// Íconos disponibles para actividades libres del horario (ej. "Gimnasio" con
// el ícono de pesas). Curado a propósito, no es un selector de ícono libre.
export const ICONOS_ACTIVIDAD = {
  Dumbbell,
  Bike,
  BookOpen,
  Briefcase,
  Coffee,
  Music,
  UtensilsCrossed,
  Palette,
  Code2,
  Users,
  Car,
  ShoppingCart,
  Heart,
  Plane,
  Gamepad2,
  Stethoscope,
} as const;

export type NombreIconoActividad = keyof typeof ICONOS_ACTIVIDAD;

export const NOMBRES_ICONOS_ACTIVIDAD = Object.keys(ICONOS_ACTIVIDAD) as NombreIconoActividad[];

export function esIconoActividadValido(nombre: string): nombre is NombreIconoActividad {
  return nombre in ICONOS_ACTIVIDAD;
}
