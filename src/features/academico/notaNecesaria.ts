import type { Materia } from '../../types/models';

// notaNecesaria = (notaObjetivo − Σ(parcial.nota × parcial.peso)) / pesoFinal
// Ver docs/BLUEPRINT.md sección 5.

export type ResultadoNotaNecesaria =
  | { tipo: 'sin_final' }
  | { tipo: 'ya_asegurado' }
  | { tipo: 'alcanzable'; notaNecesariaFinal: number }
  | { tipo: 'imposible' }
  | {
      tipo: 'posible_con_pendiente';
      parcialNombre: string;
      notaNecesariaPendiente: number;
    };

export function calcularNotaNecesaria(
  materia: Materia,
  notaObjetivo: number,
  escalaMax: number,
): ResultadoNotaNecesaria {
  if (materia.pesoFinal <= 0) return { tipo: 'sin_final' };

  const parcialesConNota = materia.parciales.filter((p) => p.nota !== null);
  const parcialPendiente = materia.parciales.find((p) => p.nota === null);

  const sumaConocidos = parcialesConNota.reduce((acc, p) => acc + p.nota! * p.peso, 0);
  const notaNecesariaFinal = (notaObjetivo - sumaConocidos) / materia.pesoFinal;

  if (notaNecesariaFinal <= 0) return { tipo: 'ya_asegurado' };
  if (notaNecesariaFinal <= escalaMax) return { tipo: 'alcanzable', notaNecesariaFinal };

  // El final por sí solo no alcanza. Si queda un parcial pendiente, ver si
  // sacando el máximo en el final ese parcial pendiente lo hace posible.
  if (parcialPendiente && parcialPendiente.peso > 0) {
    const notaNecesariaPendiente =
      (notaObjetivo - sumaConocidos - escalaMax * materia.pesoFinal) / parcialPendiente.peso;
    if (notaNecesariaPendiente <= escalaMax) {
      return {
        tipo: 'posible_con_pendiente',
        parcialNombre: parcialPendiente.nombre,
        notaNecesariaPendiente: Math.max(0, notaNecesariaPendiente),
      };
    }
  }

  return { tipo: 'imposible' };
}
