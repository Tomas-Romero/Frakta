import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatNumeroAr, parseNumeroAr } from '@/lib/numeroAr';
import { calcularNotaNecesaria } from './notaNecesaria';
import type { ConfigApp } from '@/db/db';
import type { Materia } from '@/types/models';

interface NotaNecesariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materia: Materia | null;
  escalaNotas: ConfigApp['escalaNotas'];
}

export function NotaNecesariaDialog({
  open,
  onOpenChange,
  materia,
  escalaNotas,
}: NotaNecesariaDialogProps) {
  const escalaMax = escalaNotas === '0-100' ? 100 : 10;
  const umbralAprobacion = escalaNotas === '0-100' ? 40 : 4;
  const [notaObjetivoTexto, setNotaObjetivoTexto] = useState(String(umbralAprobacion));

  if (!materia) return null;

  let notaObjetivo: number | null = null;
  try {
    notaObjetivo = parseNumeroAr(notaObjetivoTexto);
  } catch {
    notaObjetivo = null;
  }

  const resultado =
    notaObjetivo !== null ? calcularNotaNecesaria(materia, notaObjetivo, escalaMax) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setNotaObjetivoTexto(String(umbralAprobacion));
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Qué necesito para aprobar?</DialogTitle>
          <DialogDescription>{materia.nombre}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nota-objetivo">Nota objetivo (0-{escalaMax})</Label>
            <Input
              id="nota-objetivo"
              inputMode="decimal"
              value={notaObjetivoTexto}
              onChange={(e) => setNotaObjetivoTexto(e.target.value)}
            />
          </div>

          {materia.parciales.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Esta materia no tiene parciales cargados — el cálculo asume que el final define todo
              el resultado.
            </p>
          )}

          {resultado?.tipo === 'sin_final' && (
            <p className="text-sm text-muted-foreground">
              Esta materia no tiene un peso de final configurado (Peso final = 0).
            </p>
          )}
          {resultado?.tipo === 'ya_asegurado' && (
            <p className="rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              Ya te alcanza — con tus parciales actuales llegás al objetivo aunque saques 0 en el
              final.
            </p>
          )}
          {resultado?.tipo === 'alcanzable' && (
            <p className="rounded-md border border-sky-600/30 bg-sky-600/10 px-3 py-2 text-sm text-sky-700 dark:text-sky-400">
              Necesitás sacar al menos{' '}
              <strong>{formatNumeroAr(Math.round(resultado.notaNecesariaFinal * 100) / 100)}</strong>{' '}
              en el final.
            </p>
          )}
          {resultado?.tipo === 'posible_con_pendiente' && (
            <p className="rounded-md border border-amber-600/30 bg-amber-600/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              No te alcanza sacando el máximo en el final. Necesitás al menos{' '}
              <strong>
                {formatNumeroAr(Math.round(resultado.notaNecesariaPendiente * 100) / 100)}
              </strong>{' '}
              en "{resultado.parcialNombre}" (todavía sin nota cargada).
            </p>
          )}
          {resultado?.tipo === 'imposible' && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Ya no es matemáticamente posible alcanzar ese objetivo.
            </p>
          )}
          {notaObjetivo === null && (
            <p className="text-sm text-destructive">Ingresá un número válido.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
