import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { useTema } from '@/hooks/useTema';
import { revisarRecordatorios, registrarSincronizacionPeriodica } from '@/lib/notificaciones';

const INTERVALO_RECORDATORIOS_MS = 15 * 60 * 1000;

function App() {
  useTema();

  useEffect(() => {
    // Reduce el riesgo de que el navegador borre IndexedDB bajo presión de
    // espacio en disco. Ver docs/BLUEPRINT.md sección 4.
    void navigator.storage?.persist?.();

    void revisarRecordatorios();
    void registrarSincronizacionPeriodica();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void revisarRecordatorios();
    };
    document.addEventListener('visibilitychange', onVisible);
    const id = setInterval(() => void revisarRecordatorios(), INTERVALO_RECORDATORIOS_MS);

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
