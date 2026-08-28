import { minutosATexto } from './layoutSemana';
import type { BloqueHorario, DiaSemana } from '../../types/models';

const ORDEN_JS_A_DIA: DiaSemana[] = [
  'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado',
];

export interface ProximaClase {
  bloque: BloqueHorario;
  cuando: string; // "Hoy 14:00", "Mañana 09:00", "Miércoles 09:00"
}

/** Próximo bloque de horario desde `ahora`, recorriendo hasta 7 días hacia adelante. */
export function proximaClase(bloques: BloqueHorario[], ahora: Date): ProximaClase | null {
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const diaJs = (ahora.getDay() + offset) % 7;
    const dia = ORDEN_JS_A_DIA[diaJs];
    const delDia = bloques
      .filter((b) => b.dia === dia)
      .filter((b) => offset > 0 || b.horaInicioMin > minutosAhora)
      .sort((a, b) => a.horaInicioMin - b.horaInicioMin);

    if (delDia.length > 0) {
      const bloque = delDia[0];
      const prefijo = offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : capitalizar(dia);
      return { bloque, cuando: `${prefijo} ${minutosATexto(bloque.horaInicioMin)}` };
    }
  }
  return null;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
