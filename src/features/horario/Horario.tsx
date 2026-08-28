import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/db/db';
import { eliminarBloque } from '@/db/repositorios/bloquesHorario';
import { GrillaHorario } from './GrillaHorario';
import { BloqueForm } from './BloqueForm';
import type { BloqueHorario, DiaSemana } from '@/types/models';

export function Horario() {
  const materias = useLiveQuery(() => db.materias.toArray(), [], []);
  const bloques = useLiveQuery(() => db.bloquesHorario.toArray(), [], []);
  const [formAbierto, setFormAbierto] = useState(false);
  const [bloqueEditando, setBloqueEditando] = useState<BloqueHorario | undefined>(undefined);
  const [diaPorDefecto, setDiaPorDefecto] = useState<DiaSemana | undefined>(undefined);
  const [horaPorDefecto, setHoraPorDefecto] = useState<number | undefined>(undefined);

  if (!materias || !bloques) return null;

  const materiasPorId = new Map(materias.map((m) => [m.id, m]));

  function abrirNuevo() {
    setBloqueEditando(undefined);
    setDiaPorDefecto(undefined);
    setHoraPorDefecto(undefined);
    setFormAbierto(true);
  }

  function abrirEnCelda(dia: DiaSemana, horaInicioMin: number) {
    setBloqueEditando(undefined);
    setDiaPorDefecto(dia);
    setHoraPorDefecto(horaInicioMin);
    setFormAbierto(true);
  }

  function abrirEdicion(bloque: BloqueHorario) {
    setBloqueEditando(bloque);
    setDiaPorDefecto(undefined);
    setHoraPorDefecto(undefined);
    setFormAbierto(true);
  }

  if (materias.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-24 text-center text-muted-foreground">
        <p className="text-base font-medium text-foreground">Todavía no cargaste materias</p>
        <p className="text-sm">Un bloque de horario necesita estar asociado a una materia.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={abrirNuevo}>
          <Plus /> Nuevo bloque
        </Button>
      </div>

      <GrillaHorario
        bloques={bloques}
        materiasPorId={materiasPorId}
        onClickBloque={abrirEdicion}
        onClickCelda={abrirEnCelda}
      />

      <BloqueForm
        open={formAbierto}
        onOpenChange={setFormAbierto}
        bloque={bloqueEditando}
        diaPorDefecto={diaPorDefecto}
        horaInicioPorDefecto={horaPorDefecto}
        materias={materias}
        onEliminar={(b) => void eliminarBloque(b.id)}
      />
    </div>
  );
}
