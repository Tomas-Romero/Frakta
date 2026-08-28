import type { EventoCompartido, Transferencia } from '../../types/models';

// Parte contable: convierte los gastos en un balance neto por participante
// (lo que pagó, menos lo que le correspondía consumir). La exclusión por
// ítem vive en el modelo (GastoItem.participantes) — acá no hay lógica
// especial para "excluir" a nadie, simplemente no se itera sobre quien no
// está en la lista. Ver docs/BLUEPRINT.md sección 2.3.
export function calcularBalances(evento: EventoCompartido): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const p of evento.participantes) balances[p.id] = 0;

  for (const gasto of evento.gastos) {
    if (gasto.participantes.length > 0) {
      const porConsumidor = gasto.monto / gasto.participantes.length;
      for (const id of gasto.participantes) {
        balances[id] = (balances[id] ?? 0) - porConsumidor;
      }
    }
    if (gasto.pagadoPor.length > 0) {
      const porPagador = gasto.monto / gasto.pagadoPor.length;
      for (const id of gasto.pagadoPor) {
        balances[id] = (balances[id] ?? 0) + porPagador;
      }
    }
  }
  return balances;
}

/**
 * Parte de optimización: reduce los balances a la menor cantidad de
 * transferencias posibles con un algoritmo goloso (empareja en cada paso al
 * mayor acreedor con el mayor deudor, mismo enfoque que Splitwise). Como
 * mucho N-1 transferencias para N participantes, O(N log N).
 * Ver docs/BLUEPRINT.md sección 2.3.
 */
export function liquidar(balances: Record<string, number>): Transferencia[] {
  const acreedores = Object.entries(balances)
    .filter(([, v]) => v > 0.01)
    .sort((a, b) => b[1] - a[1]);
  const deudores = Object.entries(balances)
    .filter(([, v]) => v < -0.01)
    .sort((a, b) => a[1] - b[1]);
  const transferencias: Transferencia[] = [];
  let i = 0;
  let j = 0;

  while (i < acreedores.length && j < deudores.length) {
    const [acreedor, credito] = acreedores[i];
    const [deudor, deuda] = deudores[j];
    const monto = Math.min(credito, -deuda);

    transferencias.push({ de: deudor, a: acreedor, monto: Math.round(monto * 100) / 100 });
    acreedores[i][1] -= monto;
    deudores[j][1] += monto;

    if (acreedores[i][1] < 0.01) i++;
    if (deudores[j][1] > -0.01) j++;
  }
  return transferencias;
}
