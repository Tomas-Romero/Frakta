import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, obtenerConfig, type ConfigApp } from '@/db/db';
import { aplicarTema, temaCacheado } from '@/lib/tema';

/**
 * Aplica el tema activo (Dexie es la fuente de verdad) y lo re-aplica si
 * cambia la preferencia del sistema mientras el tema está en "auto".
 */
export function useTema(): ConfigApp['tema'] {
  const config = useLiveQuery(() => obtenerConfig());
  const tema = config?.tema ?? temaCacheado();

  useEffect(() => {
    aplicarTema(tema);
    if (tema !== 'auto') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => aplicarTema('auto');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [tema]);

  return tema;
}

export async function cambiarTema(tema: ConfigApp['tema']): Promise<void> {
  const actual = await obtenerConfig();
  await db.config.put({ ...actual, tema });
}
