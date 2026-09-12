import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/db/db';
import { RutinasList } from './RutinasList';
import { RutinaForm } from './RutinaForm';
import { RegistroEjercicioList } from './RegistroEjercicioList';
import { RegistroEjercicioForm } from './RegistroEjercicioForm';
import { NutricionHoy } from './NutricionHoy';
import { NutricionHistorial } from './NutricionHistorial';
import type { Rutina, RegistroEjercicio } from '@/types/models';

export function Habitos() {
  const rutinas = useLiveQuery(() => db.rutinas.toArray(), [], []);
  const registrosEjercicio = useLiveQuery(() => db.registrosEjercicio.toArray(), [], []);
  const registrosNutricion = useLiveQuery(() => db.registrosNutricion.toArray(), [], []);

  const [formRutinaAbierto, setFormRutinaAbierto] = useState(false);
  const [rutinaEditando, setRutinaEditando] = useState<Rutina | undefined>(undefined);
  const [formRegistroAbierto, setFormRegistroAbierto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<RegistroEjercicio | undefined>(undefined);

  if (!rutinas || !registrosEjercicio || !registrosNutricion) return null;

  return (
    <Tabs defaultValue="rutina" className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="rutina">Rutina</TabsTrigger>
        <TabsTrigger value="registro">Registro</TabsTrigger>
        <TabsTrigger value="nutricion">Nutrición</TabsTrigger>
      </TabsList>

      <TabsContent value="rutina" className="flex flex-col gap-4">
        <div>
          <Button
            onClick={() => {
              setRutinaEditando(undefined);
              setFormRutinaAbierto(true);
            }}
          >
            <Plus /> Nueva rutina
          </Button>
        </div>
        <RutinasList
          rutinas={rutinas}
          onEditar={(r) => {
            setRutinaEditando(r);
            setFormRutinaAbierto(true);
          }}
        />
      </TabsContent>

      <TabsContent value="registro" className="flex flex-col gap-4">
        <div>
          <Button
            onClick={() => {
              setRegistroEditando(undefined);
              setFormRegistroAbierto(true);
            }}
          >
            <Plus /> Nuevo registro
          </Button>
        </div>
        <RegistroEjercicioList
          registros={registrosEjercicio}
          onEditar={(r) => {
            setRegistroEditando(r);
            setFormRegistroAbierto(true);
          }}
        />
      </TabsContent>

      <TabsContent value="nutricion" className="flex flex-col gap-4">
        <NutricionHoy />
        <NutricionHistorial registros={registrosNutricion} />
      </TabsContent>

      <RutinaForm open={formRutinaAbierto} onOpenChange={setFormRutinaAbierto} rutina={rutinaEditando} />
      <RegistroEjercicioForm
        open={formRegistroAbierto}
        onOpenChange={setFormRegistroAbierto}
        registro={registroEditando}
      />
    </Tabs>
  );
}
