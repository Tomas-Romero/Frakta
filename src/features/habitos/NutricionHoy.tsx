import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { parseNumeroAr, formatNumeroAr } from '@/lib/numeroAr';
import {
  obtenerRegistroNutricion,
  obtenerUltimoRegistroNutricion,
  actualizarRegistroNutricion,
} from '@/db/repositorios/registrosNutricion';
import type { RegistroNutricion } from '@/types/models';

export function NutricionHoy() {
  const fechaHoy = format(new Date(), 'yyyy-MM-dd');
  const registroHoy = useLiveQuery(() => obtenerRegistroNutricion(fechaHoy), [fechaHoy]);

  // Si todavía no existe una fila para hoy, se crea heredando el objetivo de
  // proteína del último día registrado — evita re-tipear el mismo número
  // todos los días. La función de repositorio se mantiene simple; esta
  // lógica es puramente de UI.
  useEffect(() => {
    void (async () => {
      const existente = await obtenerRegistroNutricion(fechaHoy);
      if (existente) return;
      const ultimo = await obtenerUltimoRegistroNutricion();
      await actualizarRegistroNutricion(fechaHoy, { proteinaObjetivoG: ultimo?.proteinaObjetivoG ?? 0 });
    })();
  }, [fechaHoy]);

  if (!registroHoy) return null;

  return <NutricionHoyCard key={fechaHoy} fecha={fechaHoy} registro={registroHoy} />;
}

interface NutricionHoyCardProps {
  fecha: string;
  registro: RegistroNutricion;
}

function NutricionHoyCard({ fecha, registro }: NutricionHoyCardProps) {
  const [objetivo, setObjetivo] = useState(formatNumeroAr(registro.proteinaObjetivoG));
  const [lograda, setLograda] = useState(formatNumeroAr(registro.proteinaLogradaG));

  function confirmarObjetivo() {
    try {
      void actualizarRegistroNutricion(fecha, { proteinaObjetivoG: parseNumeroAr(objetivo) });
    } catch {
      setObjetivo(formatNumeroAr(registro.proteinaObjetivoG));
    }
  }

  function confirmarLograda() {
    try {
      void actualizarRegistroNutricion(fecha, { proteinaLogradaG: parseNumeroAr(lograda) });
    } catch {
      setLograda(formatNumeroAr(registro.proteinaLogradaG));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoy</CardTitle>
        <CardDescription className="capitalize">
          {format(new Date(), "eeee d 'de' MMMM", { locale: es })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proteina-objetivo">Objetivo de proteína (g)</Label>
            <Input
              id="proteina-objetivo"
              inputMode="decimal"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              onBlur={confirmarObjetivo}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proteina-lograda">Proteína consumida (g)</Label>
            <Input
              id="proteina-lograda"
              inputMode="decimal"
              value={lograda}
              onChange={(e) => setLograda(e.target.value)}
              onBlur={confirmarLograda}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="creatina-hoy">Creatina tomada</Label>
          <Switch
            id="creatina-hoy"
            checked={registro.creatinaTomada}
            onCheckedChange={(marcado) => void actualizarRegistroNutricion(fecha, { creatinaTomada: marcado })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
