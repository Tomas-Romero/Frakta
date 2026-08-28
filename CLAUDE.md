# Organizador Local-First

SPA de organización académica y personal para estudiantes y profesionales. Nombre de marca: **Frakta** (logo en `public/logo.png`, verde salvia + dorado — paleta aplicada en `src/index.css`). React + TypeScript + Vite. **Cero backend, cero registro, cero cuenta de usuario.**

## Principio no negociable

Ninguna llamada de red para persistir datos del usuario. Toda persistencia va a IndexedDB (vía Dexie.js). El único mecanismo de respaldo es el import/export manual de un JSON completo — no hay sincronización remota, no hay API propia. Si una tarea empieza a pedir "guardar en un servidor" o "agregar login", es una señal de que algo se desvió del alcance: confirmar con el usuario antes de seguir.

## Dónde está la información

| Archivo | Contenido |
|---|---|
| `docs/BLUEPRINT.md` | Arquitectura completa: navegación UX/UI, los 3 desafíos técnicos resueltos con código (Excel estilizado, fusión de celdas de horario, liquidación de gastos compartidos), esquemas de datos, stack justificado capa por capa, riesgos. Leer la sección relevante antes de tocar un módulo por primera vez. |
| `docs/ROADMAP.md` | Las 6 fases de desarrollo como checklist. Tildar `[x]` a medida que se completa cada ítem — no saltar de fase sin haber cerrado la anterior. |
| `src/types/models.ts` | Tipos TypeScript de las 6 entidades del dominio, ya definidos a partir de los esquemas del blueprint. Extender estos tipos; no redefinirlos desde cero en otro archivo. |

## Stack ya decidido (no re-evaluar salvo que algo concreto lo justifique)

React 18 + TypeScript + Vite · Dexie.js (IndexedDB) + `dexie-react-hooks` · Zustand (solo estado de UI, nunca datos de negocio) · Tailwind CSS + shadcn/ui · dnd-kit · Recharts · ExcelJS + file-saver · PapaParse · date-fns · Zod + React Hook Form · vite-plugin-pwa.

La razón de cada elección está en `docs/BLUEPRINT.md` sección 4. Una en particular importa para no repetir el error: **ExcelJS, no SheetJS**, para exportar Excel — la Community Edition de SheetJS no escribe estilos de celda (colores, rellenos) sin la versión Pro paga.

## Convenciones del proyecto

- Todo dato de negocio vive en Dexie (`src/db/`), nunca en un store de Zustand ni en `localStorage`. `localStorage` es solo para preferencias de UI livianas (tema, sidebar colapsada o no).
- Los bloques de horario se guardan con `horaInicioMin` / `horaFinMin` (minutos desde 00:00). La fusión visual de celdas se calcula en el render con CSS Grid (`grid-row: span N`) — nunca se guarda un flag de "celda fusionada" en el dato. Ver `docs/BLUEPRINT.md` sección 2.2 antes de tocar el módulo de Horario.
- Cada gasto de un evento compartido lleva su propia lista de `participantes`. Excluir a alguien de un ítem puntual es simplemente no incluirlo ahí — no crear una lógica de exclusión aparte. Ver sección 2.3.
- Toda importación (JSON, CSV o XLSX) pasa por validación Zod antes de escribir una sola fila en Dexie. Un archivo que falla la validación se rechaza entero, nunca se mezcla parcialmente.
- Montos y notas se muestran y parsean en formato Argentina: `,` como separador decimal, `;` como delimitador de CSV. No asumir el formato `.`/`,` de EE.UU. en ningún parser nuevo.
- El Dashboard es de solo lectura (widgets que llevan a su módulo); no le agregues formularios de edición propios.

## Primeros pasos (Fase 0 — ver docs/ROADMAP.md)

```bash
npm create vite@latest . -- --template react-ts
npm install dexie dexie-react-hooks zustand date-fns zod react-hook-form \
  exceljs file-saver papaparse recharts @dnd-kit/core @dnd-kit/sortable
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p
npx shadcn@latest init
```

Después de scaffoldear: armar el layout de navegación (sidebar de 3 capas, ver blueprint sección 1) y crear `src/db/db.ts` con el esquema Dexie en `schemaVersion: 1` **antes** de construir ningún módulo de contenido. El respaldo (import/export JSON) se construye primero, no al final — es lo que protege todo lo que se agregue después.

## Estado actual

Las 6 fases completas. Fase 0: scaffold Vite+React+TS, Tailwind v4 + shadcn/ui (Radix), capa Dexie (`src/db/db.ts`), `migrarBackup()` en `src/db/backup.ts`, sidebar de 3 capas + Dashboard de solo lectura, e import/export de backup JSON validado con Zod. Fase 1: CRUD de Materias (`src/features/academico/`) con métricas (promedio general/sin aplazos, % avance, horas completadas), Horario con fusión de celdas vía CSS Grid + interval partitioning (`src/features/horario/layoutSemana.ts`), e import/export CSV de materias en formato Argentina con panel de ayuda. Fase 2: Tareas (`src/features/tareas/`) con vista Lista y Kanban (dnd-kit), Pomodoro anclado a la tarea activa (`src/store/pomodoroStore.ts` + widget flotante global en `AppShell`) y la calculadora "¿Qué necesito para aprobar?" (`src/features/academico/notaNecesaria.ts`). Fase 3: Movimientos y Suscripciones recurrentes (`src/features/finanzas/`) con calendario mensual de vencimientos, Reportes con Recharts (torta por categoría, barras presupuesto vs. real) y exportación Excel estilizada con ExcelJS para Materias y Movimientos (`exportMateriasXlsx.ts`, `exportFinanzasXlsx.ts`, con `import()` dinámico para no inflar el bundle inicial). Se agregó la entidad `Presupuesto` a `src/types/models.ts` (no estaba en el blueprint original, hacía falta para "presupuesto vs. real") — esto subió `SCHEMA_VERSION_ACTUAL` a 2 en Dexie y estrenó la primera migración real en `migrarBackup()` (v1→v2, agrega `presupuestos: []` a backups viejos), probada de punta a punta con un backup v1 sintético. Fase 4: Eventos compartidos (`src/features/gastos-compartidos/`) con participantes y gastos por ítem (excluir a alguien de un gasto puntual es simplemente no tildarlo — sin lógica de exclusión aparte), algoritmo de liquidación goloso en `liquidar.ts` (calcularBalances + liquidar, igual al ejemplo del blueprint) y vista "quién le debe a quién" — verificado con el ejemplo exacto del asado de tres del blueprint (Pablo +9500, Tomás -2500, Sofía -7000 → Sofía→Pablo $7000, Tomás→Pablo $2500) y con borrado en cascada de un participante (limpia sus referencias en pagadoPor/participantes de cada gasto).

Fase 5: rebrandeo completo a **Frakta** con el logo real del usuario (`public/logo.png` — reemplazó un logo provisorio de otra marca) — paleta verde salvia (`--brand-green` `#4f7a62`/`#8fbfa0`) + dorado (`--brand-gold`) aplicada a `src/index.css` (primary, ring, sidebar, `--chart-1..5`), favicons/app-icons generados en varios tamaños, sidebar y `<title>` actualizados. Modo claro/oscuro completo: `src/lib/tema.ts` + `src/hooks/useTema.ts`, fuente de verdad en `ConfigApp.tema` (Dexie), cacheado en `localStorage` con un script inline en `index.html` para evitar el flash antes de que Dexie resuelva; selector de 3 vías (auto/claro/oscuro) en Ajustes + toggle rápido en el header. Responsive mobile: `BottomNav.tsx` de 4 slots (Dashboard/Tareas/Horario fijos + "Más" en una `Sheet`), sidebar de escritorio oculto en mobile. Recordatorios: nivel garantizado en `src/lib/notificaciones.ts` (revisa tareas y suscripciones por vencer al abrir/volver a la pestaña/cada 15 min, dedupeado por día en `localStorage`) + nivel de mejor esfuerzo con Periodic Background Sync (`src/sw.ts`, service worker propio vía `injectManifest` de `vite-plugin-pwa`, sin prometerlo en el copy). `navigator.storage.persist()` pedido al abrir la app + botón en Ajustes. Dashboard reescrito con los 5 widgets reales conectados a Dexie (antes eran placeholders de Fase 0 que habían quedado sin actualizar). CSV de Académico con botón de ayuda visible (texto, no solo ícono). Animaciones sutiles (`vista-enter` al cambiar de módulo, hover-lift en cards) — ver `src/index.css`.

Actualizar este bloque (o simplemente mirar los checkboxes de `docs/ROADMAP.md`) al retomar el proyecto en una nueva sesión de Claude Code.
