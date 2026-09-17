import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/db/db';
import { CalendarioMensual } from './CalendarioMensual';
import { FechasImportantesList } from './FechasImportantesList';
import { FechaImportanteForm } from './FechaImportanteForm';
import type { FechaImportante } from '@/types/models';

export function Calendario() {
  const fechas = useLiveQuery(() => db.fechasImportantes.toArray(), [], []);
  const [formAbierto, setFormAbierto] = useState(false);
  const [fechaEditando, setFechaEditando] = useState<FechaImportante | undefined>(undefined);

  if (!fechas) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          onClick={() => {
            setFechaEditando(undefined);
            setFormAbierto(true);
          }}
        >
          <Plus /> Nueva fecha
        </Button>
      </div>

      <CalendarioMensual fechas={fechas} />

      <FechasImportantesList
        fechas={fechas}
        onEditar={(f) => {
          setFechaEditando(f);
          setFormAbierto(true);
        }}
      />

      <FechaImportanteForm open={formAbierto} onOpenChange={setFormAbierto} fecha={fechaEditando} />
    </div>
  );
}
