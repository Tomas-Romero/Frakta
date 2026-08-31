import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { necesitaRecordatorioBackup, registrarBackupExportado } from '@/lib/backupRecordatorio';

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
  recordatorioBackupPendiente: boolean;
  irA: (vista: Vista) => void;
  alternarSidebar: () => void;
  marcarBackupExportado: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      vistaActiva: 'dashboard',
      sidebarColapsada: false,
      recordatorioBackupPendiente: necesitaRecordatorioBackup(),
      irA: (vista) => set({ vistaActiva: vista }),
      alternarSidebar: () => set((s) => ({ sidebarColapsada: !s.sidebarColapsada })),
      marcarBackupExportado: () => {
        registrarBackupExportado();
        set({ recordatorioBackupPendiente: false });
      },
    }),
    {
      name: 'ui-preferencias',
      partialize: (s) => ({ sidebarColapsada: s.sidebarColapsada }),
    },
  ),
);
