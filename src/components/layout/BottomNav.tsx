import { useState } from 'react';
import {
  CalendarClock,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUiStore, type Vista } from '@/store/uiStore';

const SLOTS_FIJOS: { vista: Vista; etiqueta: string; icono: typeof LayoutDashboard }[] = [
  { vista: 'dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard },
  { vista: 'tareas', etiqueta: 'Tareas', icono: ListTodo },
  { vista: 'horario', etiqueta: 'Horario', icono: CalendarClock },
];

const MODULOS_EN_MAS: { vista: Vista; etiqueta: string; icono: typeof LayoutDashboard }[] = [
  { vista: 'academico', etiqueta: 'Académico', icono: GraduationCap },
  { vista: 'finanzas', etiqueta: 'Finanzas', icono: Wallet },
  { vista: 'gastos-compartidos', etiqueta: 'Gastos Compartidos', icono: Users },
  { vista: 'ajustes', etiqueta: 'Ajustes & Backup', icono: Settings },
];

// Barra inferior de 4 slots para mobile: 3 destinos de consulta diaria fijos
// + "Más" con el resto en una hoja modal. Ver docs/BLUEPRINT.md sección 1.
export function BottomNav() {
  const vistaActiva = useUiStore((s) => s.vistaActiva);
  const irA = useUiStore((s) => s.irA);
  const [masAbierto, setMasAbierto] = useState(false);

  const masActivo = MODULOS_EN_MAS.some((m) => m.vista === vistaActiva);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-sidebar md:hidden">
        {SLOTS_FIJOS.map(({ vista, etiqueta, icono: Icono }) => (
          <button
            key={vista}
            type="button"
            onClick={() => irA(vista)}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors',
              vistaActiva === vista
                ? 'text-sidebar-primary'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground',
            )}
          >
            <Icono className="size-5" />
            {etiqueta}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMasAbierto(true)}
          className={cn(
            'flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors',
            masActivo ? 'text-sidebar-primary' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground',
          )}
        >
          <MoreHorizontal className="size-5" />
          Más
        </button>
      </nav>

      <Sheet open={masAbierto} onOpenChange={setMasAbierto}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Más</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 px-4 pb-6">
            {MODULOS_EN_MAS.map(({ vista, etiqueta, icono: Icono }) => (
              <button
                key={vista}
                type="button"
                onClick={() => {
                  irA(vista);
                  setMasAbierto(false);
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border p-4 text-sm transition-colors',
                  vistaActiva === vista ? 'border-primary bg-accent text-accent-foreground' : '',
                )}
              >
                <Icono className="size-5" />
                {etiqueta}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
