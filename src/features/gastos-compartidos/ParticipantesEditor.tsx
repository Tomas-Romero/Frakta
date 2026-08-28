import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { agregarParticipante, eliminarParticipante } from '@/db/repositorios/eventosCompartidos';
import type { Participante } from '@/types/models';

interface ParticipantesEditorProps {
  eventoId: string;
  participantes: Participante[];
}

export function ParticipantesEditor({ eventoId, participantes }: ParticipantesEditorProps) {
  const [nombre, setNombre] = useState('');

  function agregar() {
    const limpio = nombre.trim();
    if (limpio === '') return;
    void agregarParticipante(eventoId, limpio);
    setNombre('');
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Participantes</h3>
      <div className="flex flex-wrap gap-1.5">
        {participantes.map((p) => (
          <Badge key={p.id} variant="secondary" className="gap-1 py-1 pr-1">
            {p.nombre}
            <button
              type="button"
              onClick={() => void eliminarParticipante(eventoId, p.id)}
              className="rounded-full p-0.5 hover:bg-foreground/10"
              title="Quitar del evento"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {participantes.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no agregaste a nadie.</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              agregar();
            }
          }}
          className="max-w-48"
        />
        <Button type="button" variant="outline" size="icon" onClick={agregar}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}
