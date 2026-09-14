import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { obtenerConfig, actualizarConfig, type ConfigApp } from '@/db/db';
import { aplicarPaleta, paletaCacheada } from '@/lib/tema';

/**
 * Aplica la paleta activa (Dexie es la fuente de verdad) — eje independiente
 * de useTema()/claro-oscuro-auto. Ver ConfigApp.paleta en src/db/db.ts.
 */
export function usePaleta(): ConfigApp['paleta'] {
  const config = useLiveQuery(() => obtenerConfig());
  const paleta = config?.paleta ?? paletaCacheada();

  useEffect(() => {
    aplicarPaleta(paleta);
  }, [paleta]);

  return paleta;
}

export async function cambiarPaleta(paleta: ConfigApp['paleta']): Promise<void> {
  await actualizarConfig({ paleta });
}
