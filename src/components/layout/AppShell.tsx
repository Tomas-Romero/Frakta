import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useUiStore } from '@/store/uiStore';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { Tareas } from '@/features/tareas/Tareas';
import { Horario } from '@/features/horario/Horario';
import { Academico } from '@/features/academico/Academico';
import { Finanzas } from '@/features/finanzas/Finanzas';
import { GastosCompartidos } from '@/features/gastos-compartidos/GastosCompartidos';
import { AjustesBackup } from '@/features/ajustes/AjustesBackup';

const TITULOS: Record<string, string> = {
  dashboard: 'Dashboard',
  tareas: 'Tareas',
  horario: 'Horario',
  academico: 'Académico',
  finanzas: 'Finanzas',
  'gastos-compartidos': 'Gastos Compartidos',
  ajustes: 'Ajustes & Backup',
};

export function AppShell() {
  const vistaActiva = useUiStore((s) => s.vistaActiva);
  const sidebarColapsada = useUiStore((s) => s.sidebarColapsada);

  return (
    <SidebarProvider
      open={!sidebarColapsada}
      onOpenChange={(open) => useUiStore.setState({ sidebarColapsada: !open })}
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">{TITULOS[vistaActiva]}</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <VistaActual vista={vistaActiva} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function VistaActual({ vista }: { vista: string }) {
  switch (vista) {
    case 'dashboard':
      return <Dashboard />;
    case 'tareas':
      return <Tareas />;
    case 'horario':
      return <Horario />;
    case 'academico':
      return <Academico />;
    case 'finanzas':
      return <Finanzas />;
    case 'gastos-compartidos':
      return <GastosCompartidos />;
    case 'ajustes':
      return <AjustesBackup />;
    default:
      return null;
  }
}
