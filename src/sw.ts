/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();

// Nivel de mejor esfuerzo: con la PWA instalada en Chrome/Android, el
// navegador puede despertar el service worker cada tanto para revisar algo
// en segundo plano. No existe forma de leer Dexie desde acá sin duplicar la
// capa de datos, así que el gesto es simple: invitar a abrir la app, donde
// el nivel garantizado (visibilitychange + intervalo) hace la revisión real
// contra IndexedDB. No prometer esto en el copy — en iOS Safari y Firefox no
// ocurre. Ver docs/BLUEPRINT.md sección 5.
self.addEventListener('periodicsync', (event) => {
  const syncEvent = event as ExtendableEvent & { tag: string };
  if (syncEvent.tag !== 'frakta-recordatorios') return;
  syncEvent.waitUntil(
    self.registration.showNotification('Frakta', {
      body: 'Puede que tengas tareas o vencimientos pendientes — abrí la app para revisar.',
      icon: '/icon-192.png',
      tag: 'frakta-recordatorio-background',
    }),
  );
});
