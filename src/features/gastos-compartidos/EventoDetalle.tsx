import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { eliminarEvento } from '@/db/repositorios/eventosCompartidos';
import { ParticipantesEditor } from './ParticipantesEditor';
import { GastosList } from './GastosList';
import { GastoForm } from './GastoForm';
import { Liquidacion } from './Liquidacion';
import type { EventoCompartido, GastoItem } from '@/types/models';

interface EventoDetalleProps {
  evento: EventoCompartido;
  onVolver: () => void;
}

export function EventoDetalle({ evento, onVolver }: EventoDetalleProps) {
  const [formGastoAbierto, setFormGastoAbierto] = useState(false);
  const [gastoEditando, setGastoEditando] = useState<GastoItem | undefined>(undefined);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const participantesPorId = new Map(evento.participantes.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onVolver}>
          <ArrowLeft />
        </Button>
        <h2 className="flex-1 text-lg font-medium">{evento.nombre}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmarEliminar(true)}
        >
          <Trash2 />
        </Button>
      </div>

      <ParticipantesEditor eventoId={evento.id} participantes={evento.participantes} />

      <Tabs defaultValue="gastos">
        <TabsList>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="liquidacion">Liquidación</TabsTrigger>
        </TabsList>

        <TabsContent value="gastos" className="flex flex-col gap-3">
          <div>
            <Button
              onClick={() => {
                setGastoEditando(undefined);
                setFormGastoAbierto(true);
              }}
              disabled={evento.participantes.length === 0}
            >
              <Plus /> Nuevo gasto
            </Button>
            {evento.participantes.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Agregá participantes antes de cargar un gasto.
              </p>
            )}
          </div>
          <GastosList
            eventoId={evento.id}
            gastos={evento.gastos}
            participantesPorId={participantesPorId}
            onEditar={(g) => {
              setGastoEditando(g);
              setFormGastoAbierto(true);
            }}
          />
        </TabsContent>

        <TabsContent value="liquidacion">
          <Liquidacion evento={evento} />
        </TabsContent>
      </Tabs>

      <GastoForm
        open={formGastoAbierto}
        onOpenChange={setFormGastoAbierto}
        eventoId={evento.id}
        participantesEvento={evento.participantes}
        gasto={gastoEditando}
      />

      <AlertDialog open={confirmarEliminar} onOpenChange={setConfirmarEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{evento.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran también todos sus participantes y gastos. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void eliminarEvento(evento.id);
                onVolver();
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
