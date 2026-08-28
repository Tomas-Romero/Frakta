import { addHours, isBefore, parseISO } from 'date-fns';
import { db } from '../db/db';
import { proximosVencimientos } from '../features/finanzas/metricas';

// Nivel garantizado: revisa tareas/suscripciones próximas a vencer al abrir
// la app, al volver a la pestaña y en un intervalo mientras sigue abierta.
// Sin backend no hay push real con la app cerrada — no prometerlo.
// Ver docs/BLUEPRINT.md sección 5.

const VENTANA_HORAS = 48;
const YA_NOTIFICADOS_KEY = 'frakta-notificados';

function leerYaNotificados(): Set<string> {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const guardado = JSON.parse(localStorage.getItem(YA_NOTIFICADOS_KEY) ?? '{}');
    if (guardado.dia !== hoy) return new Set();
    return new Set(guardado.ids as string[]);
  } catch {
    return new Set();
  }
}

function guardarYaNotificados(ids: Set<string>): void {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    localStorage.setItem(YA_NOTIFICADOS_KEY, JSON.stringify({ dia: hoy, ids: [...ids] }));
  } catch {
    // localStorage puede fallar en navegación privada — no es crítico acá.
  }
}

export function permisoNotificaciones(): NotificationPermission | 'no-soportado' {
  if (!('Notification' in window)) return 'no-soportado';
  return Notification.permission;
}

export async function pedirPermisoNotificaciones(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.requestPermission();
}

function notificar(titulo: string, cuerpo: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(titulo, { body: cuerpo, icon: '/icon-192.png', tag: titulo });
}

/**
 * Nivel de mejor esfuerzo: pide registrar un Periodic Background Sync para
 * que el service worker despierte de tanto en tanto con la PWA instalada.
 * Sin soporte amplio (Chrome/Android) — falla en silencio en todo lo demás,
 * nunca se le promete esto al usuario. Ver docs/BLUEPRINT.md sección 5.
 */
export async function registrarSincronizacionPeriodica(): Promise<void> {
  try {
    const registro = await navigator.serviceWorker?.ready;
    const conPeriodicSync = registro as
      | (ServiceWorkerRegistration & {
          periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
        })
      | undefined;
    if (!conPeriodicSync?.periodicSync) return;

    const permisos = (navigator as { permissions?: Permissions }).permissions;
    const estado = await permisos?.query({
      name: 'periodic-background-sync' as PermissionName,
    });
    if (estado?.state !== 'granted') return;

    await conPeriodicSync.periodicSync.register('frakta-recordatorios', {
      minInterval: 12 * 60 * 60 * 1000,
    });
  } catch {
    // Best-effort — sin soporte o sin permiso, seguimos con el nivel garantizado.
  }
}

export async function revisarRecordatorios(): Promise<void> {
  if (permisoNotificaciones() !== 'granted') return;

  const ahora = new Date();
  const limite = addHours(ahora, VENTANA_HORAS);
  const yaNotificados = leerYaNotificados();

  const tareas = await db.tareas.toArray();
  for (const t of tareas) {
    if (t.estado === 'completado' || t.fechaLimite === null) continue;
    if (!isBefore(parseISO(t.fechaLimite), limite)) continue;
    const clave = `tarea-${t.id}`;
    if (yaNotificados.has(clave)) continue;
    notificar('Tarea por vencer', t.titulo);
    yaNotificados.add(clave);
  }

  const suscripciones = await db.suscripciones.toArray();
  const vencimientos = proximosVencimientos(suscripciones, ahora, 2);
  for (const v of vencimientos) {
    const clave = `suscripcion-${v.suscripcion.id}-${v.fecha.toISOString().slice(0, 10)}`;
    if (yaNotificados.has(clave)) continue;
    notificar('Débito automático próximo', `${v.suscripcion.nombre} — vence pronto`);
    yaNotificados.add(clave);
  }

  guardarYaNotificados(yaNotificados);
}
