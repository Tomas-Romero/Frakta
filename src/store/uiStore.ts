import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Estado de UI únicamente (pestaña activa, colapso de sidebar). Ningún dato
// de negocio vive acá — eso es Dexie. Ver CLAUDE.md "Convenciones del proyecto".

export type Vista =
  | 'dashboard'
  | 'tareas'
  | 'horario'
  | 'academico'
  | 'finanzas'
  | 'gastos-compartidos'
  | 'ajustes';

interface UiState {
  vistaActiva: Vista;
  sidebarColapsada: boolean;
  irA: (vista: Vista) => void;
  alternarSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      vistaActiva: 'dashboard',
      sidebarColapsada: false,
      irA: (vista) => set({ vistaActiva: vista }),
      alternarSidebar: () => set((s) => ({ sidebarColapsada: !s.sidebarColapsada })),
    }),
    {
      name: 'ui-preferencias',
      partialize: (s) => ({ sidebarColapsada: s.sidebarColapsada }),
    },
  ),
);
