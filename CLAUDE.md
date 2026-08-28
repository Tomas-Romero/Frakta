# Organizador Local-First

SPA de organización académica y personal para estudiantes y profesionales. React + TypeScript + Vite. **Cero backend, cero registro, cero cuenta de usuario.**

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

Fase 0 y Fase 1 completas. Fase 0: scaffold Vite+React+TS, Tailwind v4 + shadcn/ui (Radix), capa Dexie (`src/db/db.ts`) en `schemaVersion: 1`, `migrarBackup()` en `src/db/backup.ts`, sidebar de 3 capas + Dashboard de solo lectura, e import/export de backup JSON validado con Zod. Fase 1: CRUD de Materias (`src/features/academico/`) con métricas (promedio general/sin aplazos, % avance, horas completadas), Horario con fusión de celdas vía CSS Grid + interval partitioning (`src/features/horario/layoutSemana.ts`, verificado con bloques superpuestos), e import/export CSV de materias en formato Argentina con panel de ayuda — rechazo entero ante fila inválida, verificado a mano. Fase 2 (Productividad) sin empezar. Actualizar esta línea (o simplemente mirar los checkboxes de `docs/ROADMAP.md`) al retomar el proyecto en una nueva sesión de Claude Code.
