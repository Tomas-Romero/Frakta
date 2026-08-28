import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// El Dashboard es siempre de solo lectura: cada widget resume su módulo y
// lleva a él, nunca trae formularios de edición propios.
// Ver CLAUDE.md "Convenciones del proyecto" y BLUEPRINT.md sección 1.
const WIDGETS = [
  { titulo: 'Próxima clase', descripcion: 'Se completa junto con Horario (Fase 1).' },
  { titulo: 'Tareas próximas a vencer', descripcion: 'Se completa junto con Tareas (Fase 2).' },
  { titulo: 'Gasto del mes vs. presupuesto', descripcion: 'Se completa junto con Finanzas (Fase 3).' },
  { titulo: 'Promedio académico', descripcion: 'Se completa junto con Académico (Fase 1).' },
  { titulo: 'Débitos automáticos próximos', descripcion: 'Se completa junto con Finanzas (Fase 3).' },
];

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {WIDGETS.map((w) => (
        <Card key={w.titulo}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{w.titulo}</CardTitle>
            <CardDescription>{w.descripcion}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
