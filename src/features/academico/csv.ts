import Papa from 'papaparse';
import { z } from 'zod';
import { db } from '../../db/db';
import { parseNumeroAr, formatNumeroAr } from '../../lib/numeroAr';
import type { EstadoMateria, Materia } from '../../types/models';

// Formato Argentina: `;` como delimitador de CSV. Ver CLAUDE.md "Convenciones del proyecto".

export const ENCABEZADOS_CSV = [
  'Materia',
  'Año',
  'Hs/semana',
  'Horas totales',
  'Nota',
  'Estado',
  'Peso final',
] as const;

const ESTADOS_VALIDOS: EstadoMateria[] = ['PorCursar', 'Cursando', 'Regular', 'Aprobado'];

const filaCsvSchema = z.object({
  Materia: z.string().trim().min(1, 'la columna "Materia" no puede estar vacía'),
  Año: z.string(),
  'Hs/semana': z.string(),
  'Horas totales': z.string(),
  Nota: z.string(),
  Estado: z.string(),
  'Peso final': z.string(),
});

function maximoEscala(escalaNotas: '1-10' | '0-100'): number {
  return escalaNotas === '0-100' ? 100 : 10;
}

function filaAMateria(
  fila: unknown,
  numeroFila: number,
  escalaNotas: '1-10' | '0-100',
): Omit<Materia, 'id' | 'creadoEn' | 'actualizadoEn'> {
  const contexto = `Fila ${numeroFila}`;
  const parseado = filaCsvSchema.safeParse(fila);
  if (!parseado.success) {
    throw new Error(`${contexto}: ${z.prettifyError(parseado.error)}`);
  }
  const f = parseado.data;

  const estado = f.Estado.trim() as EstadoMateria;
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error(
      `${contexto}: "Estado" debe ser uno de ${ESTADOS_VALIDOS.join(', ')} (llegó "${f.Estado}")`,
    );
  }

  let anioCursado: number, semanal: number, total: number, pesoFinal: number, nota: number | null;
  try {
    anioCursado = Math.trunc(parseNumeroAr(f.Año));
    semanal = parseNumeroAr(f['Hs/semana']);
    total = parseNumeroAr(f['Horas totales']);
    pesoFinal = f['Peso final'].trim() === '' ? 1 : parseNumeroAr(f['Peso final']);
    nota = f.Nota.trim() === '' ? null : parseNumeroAr(f.Nota);
  } catch (error) {
    throw new Error(`${contexto}: ${(error as Error).message}`);
  }

  const max = maximoEscala(escalaNotas);
  if (nota !== null && (nota < 0 || nota > max)) {
    throw new Error(`${contexto}: "Nota" debe estar entre 0 y ${max} (llegó ${nota})`);
  }
  if (pesoFinal < 0 || pesoFinal > 1) {
    throw new Error(`${contexto}: "Peso final" debe estar entre 0 y 1 (llegó ${pesoFinal})`);
  }

  return {
    nombre: f.Materia.trim(),
    anioCursado,
    cargaHoraria: { semanal, total },
    estado,
    nota,
    parciales: [],
    pesoFinal,
    correlativas: [],
  };
}

/**
 * Parsea y valida el CSV entero antes de escribir una sola fila en Dexie.
 * Si una fila falla, se rechaza el archivo completo (nunca una carga parcial).
 */
export async function importarMateriasDesdeCsv(
  texto: string,
  escalaNotas: '1-10' | '0-100',
): Promise<number> {
  const resultado = Papa.parse<Record<string, string>>(texto, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  });

  if (resultado.errors.length > 0) {
    throw new Error(`No se pudo leer el CSV: ${resultado.errors[0].message}`);
  }

  const nuevasMaterias = resultado.data.map((fila, i) => filaAMateria(fila, i + 2, escalaNotas));

  const ahora = new Date().toISOString();
  const materiasConId: Materia[] = nuevasMaterias.map((m) => ({
    ...m,
    id: crypto.randomUUID(),
    creadoEn: ahora,
    actualizadoEn: ahora,
  }));

  await db.materias.bulkAdd(materiasConId);
  return materiasConId.length;
}

export function exportarMateriasComoCsv(materias: Materia[]): string {
  const filas = materias.map((m) => ({
    Materia: m.nombre,
    Año: String(m.anioCursado),
    'Hs/semana': formatNumeroAr(m.cargaHoraria.semanal),
    'Horas totales': formatNumeroAr(m.cargaHoraria.total),
    Nota: m.nota === null ? '' : formatNumeroAr(m.nota),
    Estado: m.estado,
    'Peso final': formatNumeroAr(m.pesoFinal),
  }));
  return Papa.unparse(
    { fields: [...ENCABEZADOS_CSV], data: filas },
    { delimiter: ';' },
  );
}
