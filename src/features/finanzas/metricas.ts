import {
  addDays,
  addMonths,
  getDaysInMonth,
  isSameMonth,
  isWithinInterval,
  parseISO,
  setDate,
  startOfDay,
} from 'date-fns';
import type { MovimientoFinanciero, Presupuesto, SuscripcionRecurrente } from '../../types/models';

export interface ResumenMes {
  ingresos: number;
  gastos: number;
  balance: number;
}

function delMes(movimientos: MovimientoFinanciero[], mesReferencia: Date): MovimientoFinanciero[] {
  return movimientos.filter((m) => isSameMonth(parseISO(m.fecha), mesReferencia));
}

export function resumenMes(movimientos: MovimientoFinanciero[], mesReferencia: Date): ResumenMes {
  const delMesActual = delMes(movimientos, mesReferencia);
  const ingresos = delMesActual
    .filter((m) => m.tipo === 'ingreso')
    .reduce((acc, m) => acc + m.monto, 0);
  const gastos = delMesActual
    .filter((m) => m.tipo === 'gasto')
    .reduce((acc, m) => acc + m.monto, 0);
  return { ingresos, gastos, balance: ingresos - gastos };
}

export interface GastoCategoria {
  categoria: string;
  monto: number;
}

export function gastoPorCategoria(
  movimientos: MovimientoFinanciero[],
  mesReferencia: Date,
): GastoCategoria[] {
  const gastos = delMes(movimientos, mesReferencia).filter((m) => m.tipo === 'gasto');
  const porCategoria = new Map<string, number>();
  for (const g of gastos) {
    porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + g.monto);
  }
  return [...porCategoria.entries()]
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((a, b) => b.monto - a.monto);
}

export interface PresupuestoVsReal {
  categoria: string;
  presupuestado: number;
  real: number;
}

export function presupuestoVsReal(
  movimientos: MovimientoFinanciero[],
  presupuestos: Presupuesto[],
  mesReferencia: Date,
): PresupuestoVsReal[] {
  const real = new Map(gastoPorCategoria(movimientos, mesReferencia).map((g) => [g.categoria, g.monto]));
  const presupuestado = new Map(presupuestos.map((p) => [p.categoria, p.montoMensual]));
  const categorias = new Set([...real.keys(), ...presupuestado.keys()]);
  return [...categorias]
    .map((categoria) => ({
      categoria,
      presupuestado: presupuestado.get(categoria) ?? 0,
      real: real.get(categoria) ?? 0,
    }))
    .sort((a, b) => b.real - a.real);
}

export interface VencimientoProximo {
  suscripcion: SuscripcionRecurrente;
  fecha: Date;
}

/**
 * Próxima ocurrencia de cada suscripción activa dentro de la ventana
 * [hoy, hoy + dias]. `diaDelMes` se recorta al último día real del mes
 * (ej. 31 en febrero -> 28/29).
 */
export function proximosVencimientos(
  suscripciones: SuscripcionRecurrente[],
  hoy: Date,
  dias: number,
): VencimientoProximo[] {
  const inicio = startOfDay(hoy);
  const fin = addDays(inicio, dias);

  return suscripciones
    .filter((s) => s.activa)
    .map((s) => ({ suscripcion: s, fecha: proximaOcurrencia(s.diaDelMes, inicio) }))
    .filter((v) => isWithinInterval(v.fecha, { start: inicio, end: fin }))
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

function proximaOcurrencia(diaDelMes: number, desde: Date): Date {
  const diaEsteMes = Math.min(diaDelMes, getDaysInMonth(desde));
  const esteMes = startOfDay(setDate(desde, diaEsteMes));
  if (esteMes >= desde) return esteMes;

  const proximoMes = addMonths(desde, 1);
  const diaProximoMes = Math.min(diaDelMes, getDaysInMonth(proximoMes));
  return startOfDay(setDate(proximoMes, diaProximoMes));
}

export function totalMensualSuscripciones(suscripciones: SuscripcionRecurrente[]): number {
  return suscripciones.filter((s) => s.activa).reduce((acc, s) => acc + s.monto, 0);
}
