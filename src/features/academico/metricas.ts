import type { Materia } from '../../types/models';
import type { ConfigApp } from '../../db/db';

// Nota mínima de aprobación por escala — usada para "promedio sin aplazos".
function umbralAprobacion(escalaNotas: ConfigApp['escalaNotas']): number {
  return escalaNotas === '0-100' ? 40 : 4;
}

function conNota(materias: Materia[]): (Materia & { nota: number })[] {
  return materias.filter((m): m is Materia & { nota: number } => m.nota !== null);
}

export function promedioGeneral(materias: Materia[]): number | null {
  const conNotaAsignada = conNota(materias);
  if (conNotaAsignada.length === 0) return null;
  const suma = conNotaAsignada.reduce((acc, m) => acc + m.nota, 0);
  return suma / conNotaAsignada.length;
}

export function promedioSinAplazos(
  materias: Materia[],
  escalaNotas: ConfigApp['escalaNotas'],
): number | null {
  const umbral = umbralAprobacion(escalaNotas);
  const aprobadas = conNota(materias).filter((m) => m.nota >= umbral);
  if (aprobadas.length === 0) return null;
  const suma = aprobadas.reduce((acc, m) => acc + m.nota, 0);
  return suma / aprobadas.length;
}

export function porcentajeAvance(materias: Materia[]): number {
  if (materias.length === 0) return 0;
  const aprobadas = materias.filter((m) => m.estado === 'Aprobado').length;
  return (aprobadas / materias.length) * 100;
}

export function horasCompletadas(materias: Materia[]): number {
  return materias
    .filter((m) => m.estado === 'Aprobado')
    .reduce((acc, m) => acc + m.cargaHoraria.total, 0);
}
