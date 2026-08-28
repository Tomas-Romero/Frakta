import { ArrowRight } from 'lucide-react';
import { formatNumeroAr } from '@/lib/numeroAr';
import { calcularBalances, liquidar } from './liquidar';
import type { EventoCompartido } from '@/types/models';

interface LiquidacionProps {
  evento: EventoCompartido;
}

export function Liquidacion({ evento }: LiquidacionProps) {
  const participantesPorId = new Map(evento.participantes.map((p) => [p.id, p]));
  const balances = calcularBalances(evento);
  const transferencias = liquidar(balances);

  if (evento.participantes.length === 0 || evento.gastos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Agregá participantes y al menos un gasto para ver la liquidación.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {evento.participantes.map((p) => {
          const balance = balances[p.id] ?? 0;
          const color =
            balance > 0.01
              ? 'text-emerald-700 dark:text-emerald-400'
              : balance < -0.01
                ? 'text-destructive'
                : 'text-muted-foreground';
          return (
            <div key={p.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{p.nombre}</p>
              <p className={`text-lg font-semibold ${color}`}>
                {balance > 0.01 ? '+' : ''}
                ${formatNumeroAr(Math.round(balance * 100) / 100)}
              </p>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Quién le debe a quién</h3>
        {transferencias.length === 0 ? (
          <p className="rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            Todos están saldados — no hace falta ninguna transferencia.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {transferencias.map((t, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium">{participantesPorId.get(t.de)?.nombre ?? '?'}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
                <span className="font-medium">{participantesPorId.get(t.a)?.nombre ?? '?'}</span>
                <span className="ml-auto font-semibold">${formatNumeroAr(t.monto)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
