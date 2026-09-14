import type { ConfigApp } from '@/db/db';

// `localStorage` es solo caché para pintar el tema correcto antes de que
// Dexie resuelva (evita el flash) — la fuente de verdad sigue siendo
// `ConfigApp.tema` en Dexie, que viaja en el backup.
export const TEMA_CACHE_KEY = 'frakta-tema';

type Tema = ConfigApp['tema'];

function prefiereOscuro(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function esOscuro(tema: Tema): boolean {
  return tema === 'oscuro' || (tema === 'auto' && prefiereOscuro());
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.classList.toggle('dark', esOscuro(tema));
  try {
    localStorage.setItem(TEMA_CACHE_KEY, tema);
  } catch {
    // localStorage puede fallar en navegación privada — no es crítico acá.
  }
}

export function temaCacheado(): Tema {
  try {
    const guardado = localStorage.getItem(TEMA_CACHE_KEY);
    if (guardado === 'auto' || guardado === 'claro' || guardado === 'oscuro') return guardado;
  } catch {
    // ignorar
  }
  return 'auto';
}

// Eje independiente de `tema` (claro/oscuro/auto) — ver ConfigApp.paleta en
// src/db/db.ts. Mismo mecanismo de caché anti-flash que el tema.
export const PALETA_CACHE_KEY = 'frakta-paleta';

type Paleta = ConfigApp['paleta'];

const PALETAS_VALIDAS: Paleta[] = ['default', 'oceano', 'lila', 'minimalista'];

export function aplicarPaleta(paleta: Paleta): void {
  if (paleta === 'default') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = paleta;
  }
  try {
    localStorage.setItem(PALETA_CACHE_KEY, paleta);
  } catch {
    // localStorage puede fallar en navegación privada — no es crítico acá.
  }
}

export function paletaCacheada(): Paleta {
  try {
    const guardada = localStorage.getItem(PALETA_CACHE_KEY);
    if (PALETAS_VALIDAS.includes(guardada as Paleta)) return guardada as Paleta;
  } catch {
    // ignorar
  }
  return 'default';
}
