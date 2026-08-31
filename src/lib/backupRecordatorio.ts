import { differenceInDays } from 'date-fns';

// Recordatorio discreto de backup — ver docs/BLUEPRINT.md sección 1: "un
// punto de color en el ícono de Ajustes... cuando pasen más de catorce días
// sin una exportación". Solo un caché de UI en localStorage, no es dato de
// negocio.
const KEY = 'frakta-ultimo-backup';
const DIAS_LIMITE = 14;

export function registrarBackupExportado(): void {
  try {
    localStorage.setItem(KEY, new Date().toISOString());
  } catch {
    // localStorage puede fallar en navegación privada — no es crítico acá.
  }
}

export function necesitaRecordatorioBackup(): boolean {
  try {
    const guardado = localStorage.getItem(KEY);
    if (!guardado) return true;
    return differenceInDays(new Date(), new Date(guardado)) >= DIAS_LIMITE;
  } catch {
    return false;
  }
}
