import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { db } from '@/db/db';
import { crearEvento } from '@/db/repositorios/eventosCompartidos';
import { formatNumeroAr } from '@/lib/numeroAr';
import { EventoDetalle } from './EventoDetalle';

export function GastosCompartidos() {
  const eventos = useLiveQuery(() => db.eventosCompartidos.toArray(), [], []);
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<string | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');

  if (!eventos) return null;

  const eventoSeleccionado = eventos.find((e) => e.id === eventoSeleccionadoId);

  if (eventoSeleccionado) {
    return (
      <EventoDetalle evento={eventoSeleccionado} onVolver={() => setEventoSeleccionadoId(null)} />
    );
  }

  async function crear() {
    const limpio = nombreNuevo.trim();
    if (limpio === '') return;
    const evento = await crearEvento(limpio);
    setNombreNuevo('');
    setFormAbierto(false);
    setEventoSeleccionadoId(evento.id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={() => setFormAbierto(true)}>
          <Plus /> Nuevo evento
        </Button>
      </div>

      {eventos.length === 0 ? (
        <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no creaste ningún evento compartido.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((e) => {
            const total = e.gastos.reduce((acc, g) => acc + g.monto, 0);
            return (
              <Card
                key={e.id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() => setEventoSeleccionadoId(e.id)}
              >
                <CardHeader>
                  <CardTitle>{e.nombre}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Users className="size-3.5" /> {e.participantes.length} · {e.gastos.length}{' '}
                    gastos · ${formatNumeroAr(total)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={formAbierto} onOpenChange={setFormAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo evento compartido</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Asado del sábado"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void crear();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void crear()}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
