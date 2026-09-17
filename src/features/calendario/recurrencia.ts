import { addMonths, getDaysInMonth, isSameMonth, parseISO, setDate, startOfDay, startOfMonth } from 'date-fns';
import type { FechaImportante } from '@/types/models';

// Lógica de dominio del calendario — consumida por la grilla mensual, la
// lista plana y el widget del Dashboard. No es "metricas.ts": no agrega
// datos para un reporte, interpreta las reglas de recurrencia en sí mismas.

const MESES_A_BUSCAR = 24; // 'meses_especificos' puede saltear casi todo el año

/** Día del mes en que cae `fecha` dentro de `mes`, o null si no ocurre ese mes. */
export function ocurrenciaEnMes(fecha: FechaImportante, mes: Date): number | null {
  const diasEnMes = getDaysInMonth(mes);
  switch (fecha.tipoRecurrencia) {
    case 'unica': {
      if (!fecha.fechaUnica) return null;
      const d = parseISO(fecha.fechaUnica);
      return isSameMonth(d, mes) ? d.getDate() : null;
    }
    case 'anual': {
      if (fecha.mesAnual === null || fecha.diaAnual === null) return null;
      return mes.getMonth() + 1 === fecha.mesAnual ? Math.min(fecha.diaAnual, diasEnMes) : null;
    }
    case 'mensual':
      return fecha.diaMensual === null ? null : Math.min(fecha.diaMensual, diasEnMes);
    case 'meses_especificos': {
      if (
        fecha.diaMesesEspecificos === null ||
        !fecha.mesesEspecificos?.includes(mes.getMonth() + 1)
      ) {
        return null;
      }
      return Math.min(fecha.diaMesesEspecificos, diasEnMes);
    }
    default:
      return null;
  }
}

/**
 * Próxima ocurrencia desde `desde` (inclusive). Una 'unica' ya pasada
 * devuelve null — nunca se auto-archiva, solo deja de aparecer como "próxima".
 */
export function proximaOcurrencia(fecha: FechaImportante, desde: Date): Date | null {
  if (fecha.tipoRecurrencia === 'unica') {
    if (!fecha.fechaUnica) return null;
    const d = startOfDay(parseISO(fecha.fechaUnica));
    return d >= startOfDay(desde) ? d : null;
  }

  let cursor = startOfMonth(desde);
  for (let i = 0; i < MESES_A_BUSCAR; i++) {
    const dia = ocurrenciaEnMes(fecha, cursor);
    if (dia !== null) {
      const candidata = startOfDay(setDate(cursor, dia));
      if (candidata >= startOfDay(desde)) return candidata;
    }
    cursor = addMonths(cursor, 1);
  }
  return null;
}
