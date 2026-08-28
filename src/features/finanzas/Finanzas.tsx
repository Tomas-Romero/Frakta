import { Suspense, lazy, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileSpreadsheet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/db/db';
import { ListaMovimientos } from './ListaMovimientos';
import { MovimientoForm } from './MovimientoForm';
import { ListaSuscripciones } from './ListaSuscripciones';
import { SuscripcionForm } from './SuscripcionForm';
import { CalendarioSuscripciones } from './CalendarioSuscripciones';
import type { MovimientoFinanciero, SuscripcionRecurrente } from '@/types/models';

const ReportesFinanzas = lazy(() =>
  import('./ReportesFinanzas').then((m) => ({ default: m.ReportesFinanzas })),
);

export function Finanzas() {
  const movimientos = useLiveQuery(() => db.movimientos.toArray(), [], []);
  const suscripciones = useLiveQuery(() => db.suscripciones.toArray(), [], []);
  const presupuestos = useLiveQuery(() => db.presupuestos.toArray(), [], []);

  const [formMovAbierto, setFormMovAbierto] = useState(false);
  const [movEditando, setMovEditando] = useState<MovimientoFinanciero | undefined>(undefined);
  const [formSuscAbierto, setFormSuscAbierto] = useState(false);
  const [suscEditando, setSuscEditando] = useState<SuscripcionRecurrente | undefined>(undefined);

  if (!movimientos || !suscripciones || !presupuestos) return null;

  const categoriasMovimientos = [...new Set(movimientos.map((m) => m.categoria))].sort();
  const categoriasSuscripciones = [...new Set(suscripciones.map((s) => s.categoria))].sort();

  return (
    <Tabs defaultValue="movimientos" className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        <TabsTrigger value="suscripciones">Suscripciones</TabsTrigger>
        <TabsTrigger value="reportes">Reportes</TabsTrigger>
      </TabsList>

      <TabsContent value="movimientos" className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setMovEditando(undefined);
              setFormMovAbierto(true);
            }}
          >
            <Plus /> Nuevo movimiento
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              void import('./exportFinanzasXlsx').then((m) =>
                m.exportarMovimientosComoXlsx(movimientos),
              )
            }
            disabled={movimientos.length === 0}
          >
            <FileSpreadsheet /> Exportar Excel
          </Button>
        </div>
        <ListaMovimientos
          movimientos={movimientos}
          onEditar={(m) => {
            setMovEditando(m);
            setFormMovAbierto(true);
          }}
        />
      </TabsContent>

      <TabsContent value="suscripciones" className="flex flex-col gap-4">
        <div>
          <Button
            onClick={() => {
              setSuscEditando(undefined);
              setFormSuscAbierto(true);
            }}
          >
            <Plus /> Nueva suscripción
          </Button>
        </div>
        <CalendarioSuscripciones suscripciones={suscripciones} />
        <ListaSuscripciones
          suscripciones={suscripciones}
          onEditar={(s) => {
            setSuscEditando(s);
            setFormSuscAbierto(true);
          }}
        />
      </TabsContent>

      <TabsContent value="reportes">
        <Suspense fallback={<p className="py-12 text-center text-sm text-muted-foreground">Cargando reportes…</p>}>
          <ReportesFinanzas movimientos={movimientos} presupuestos={presupuestos} />
        </Suspense>
      </TabsContent>

      <MovimientoForm
        open={formMovAbierto}
        onOpenChange={setFormMovAbierto}
        movimiento={movEditando}
        categoriasSugeridas={categoriasMovimientos}
      />
      <SuscripcionForm
        open={formSuscAbierto}
        onOpenChange={setFormSuscAbierto}
        suscripcion={suscEditando}
        categoriasSugeridas={categoriasSuscripciones}
      />
    </Tabs>
  );
}
