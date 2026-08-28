import type { BloqueHorario, DiaSemana } from '../../types/models';

// El dato nunca sabe que existen celdas fusionadas: la fusión visual se
// calcula acá, en el render, a partir de horaInicioMin/horaFinMin.
// Ver docs/BLUEPRINT.md sección 2.2. No agregar un flag de "fusionada" al modelo.

export const APERTURA_MIN = 7 * 60; // 07:00
export const CIERRE_MIN = 23 * 60; // 23:00
export const SLOT_MIN = 30;
export const TOTAL_SLOTS = (CIERRE_MIN - APERTURA_MIN) / SLOT_MIN;

export const DIAS: DiaSemana[] = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
];

export const ETIQUETA_DIA: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export interface BloqueConLayout extends BloqueHorario {
  filaInicio: number; // fila de grilla (1-indexado) dentro del rango de la grilla
  filaSpan: number;
  carril: number;
  totalCarriles: number;
  anchoPct: number;
  offsetPct: number;
}

/**
 * Asigna posición y carril a cada bloque de un día, mediante un barrido
 * goloso de interval partitioning (mismo enfoque que un calendario tipo
 * Google Calendar). Ver docs/BLUEPRINT.md sección 2.2.
 */
export function layoutDia(bloquesDelDia: BloqueHorario[]): BloqueConLayout[] {
  const conPosicion = bloquesDelDia.map((b) => ({
    ...b,
    filaInicio: Math.floor((b.horaInicioMin - APERTURA_MIN) / SLOT_MIN) + 1,
    filaSpan: Math.max(1, Math.ceil((b.horaFinMin - b.horaInicioMin) / SLOT_MIN)),
  }));

  const ordenados = [...conPosicion].sort((a, b) => a.horaInicioMin - b.horaInicioMin);
  const carrilesLibresDesde: number[] = [];
  const conCarril = ordenados.map((b) => {
    let i = carrilesLibresDesde.findIndex((libreDesde) => libreDesde <= b.horaInicioMin);
    if (i === -1) i = carrilesLibresDesde.length;
    carrilesLibresDesde[i] = b.horaFinMin;
    return { ...b, carril: i };
  });

  const totalCarriles = carrilesLibresDesde.length || 1;
  return conCarril.map((b) => ({
    ...b,
    totalCarriles,
    anchoPct: 100 / totalCarriles,
    offsetPct: b.carril * (100 / totalCarriles),
  }));
}

export function agruparPorDia(bloques: BloqueHorario[]): Record<DiaSemana, BloqueHorario[]> {
  const grupos = Object.fromEntries(DIAS.map((d) => [d, [] as BloqueHorario[]])) as Record<
    DiaSemana,
    BloqueHorario[]
  >;
  for (const b of bloques) grupos[b.dia].push(b);
  return grupos;
}

export function minutosATexto(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function textoAMinutos(texto: string): number {
  const [h, m] = texto.split(':').map(Number);
  return h * 60 + m;
}
