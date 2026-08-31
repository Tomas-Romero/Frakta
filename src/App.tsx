import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { useTema } from '@/hooks/useTema';
import { obtenerConfig } from '@/db/db';
import { revisarRecordatorios, registrarSincronizacionPeriodica } from '@/lib/notificaciones';

const INTERVALO_RECORDATORIOS_MS = 15 * 60 * 1000;

function App() {
  useTema();

  useEffect(() => {
    const revisarSiCorresponde = async () => {
      const config = await obtenerConfig();
      if (config.recordatoriosActivos) void revisarRecordatorios();
    };

    void (async () => {
      const config = await obtenerConfig();
      // Reduce el riesgo de que el navegador borre IndexedDB bajo presión de
      // espacio en disco. Cancelable desde Ajustes. Ver docs/BLUEPRINT.md sección 4.
      if (config.almacenamientoPersistenteActivo) void navigator.storage?.persist?.();
      if (config.recordatoriosActivos) void registrarSincronizacionPeriodica();
    })();

    void revisarSiCorresponde();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void revisarSiCorresponde();
    };
    document.addEventListener('visibilitychange', onVisible);
    const id = setInterval(() => void revisarSiCorresponde(), INTERVALO_RECORDATORIOS_MS);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(id);
    };
  }, []);

  return (
    <TooltipProvider>
      <AppShell />
    </TooltipProvider>
  );
}

export default App;
