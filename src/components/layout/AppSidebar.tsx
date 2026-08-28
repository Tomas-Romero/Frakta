import {
  LayoutDashboard,
  ListTodo,
  CalendarClock,
  GraduationCap,
  Wallet,
  Users,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUiStore, type Vista } from '@/store/uiStore';

// Orden por frecuencia de uso esperada, no alfabético.
// Ver docs/BLUEPRINT.md sección 1.
const MODULOS_CONTENIDO: { vista: Vista; etiqueta: string; icono: typeof LayoutDashboard }[] = [
  { vista: 'tareas', etiqueta: 'Tareas', icono: ListTodo },
  { vista: 'horario', etiqueta: 'Horario', icono: CalendarClock },
  { vista: 'academico', etiqueta: 'Académico', icono: GraduationCap },
  { vista: 'finanzas', etiqueta: 'Finanzas', icono: Wallet },
  { vista: 'gastos-compartidos', etiqueta: 'Gastos Compartidos', icono: Users },
];

export function AppSidebar() {
  const vistaActiva = useUiStore((s) => s.vistaActiva);
  const irA = useUiStore((s) => s.irA);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => irA('dashboard')}
              isActive={vistaActiva === 'dashboard'}
            >
              <LayoutDashboard />
              <span className="font-semibold">Organizador</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULOS_CONTENIDO.map(({ vista, etiqueta, icono: Icono }) => (
                <SidebarMenuItem key={vista}>
                  <SidebarMenuButton
                    onClick={() => irA(vista)}
                    isActive={vistaActiva === vista}
                    tooltip={etiqueta}
                  >
                    <Icono />
                    <span>{etiqueta}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => irA('ajustes')}
              isActive={vistaActiva === 'ajustes'}
              tooltip="Ajustes & Backup"
            >
              <Settings />
              <span>Ajustes & Backup</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
