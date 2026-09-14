# Roadmap

Seis fases. La primera no es la más vistosa a propósito: es la que protege todo lo que viene después. Tildar cada ítem (`- [x]`) al completarlo — no arrancar una fase sin haber cerrado los ítems clave de la anterior. El detalle técnico de cada decisión está en [`BLUEPRINT.md`](./BLUEPRINT.md).

## Fase 0 — Fundaciones + Backup primero (1–2 semanas)

El módulo de import/export JSON completo se construye antes que cualquier módulo de contenido, aunque exporte un objeto casi vacío. Así, desde el primer commit útil, cualquier dato que un módulo posterior agregue ya tiene red de seguridad.

- [x] Setup Vite + React + TS + Tailwind + shadcn/ui
- [x] Capa Dexie (`src/db/db.ts`) con `schemaVersion: 1`
- [x] Función `migrarBackup()` implementada (aunque no tenga nada que migrar todavía)
- [x] Sidebar + Dashboard vacío (layout de navegación de BLUEPRINT.md sección 1)
- [x] Import/export JSON global, con validación Zod contra `BackupCompleto`

## Fase 1 — MVP académico (2–3 semanas)

- [x] CRUD de Materias
- [x] Métricas: promedio general, promedio sin aplazos, % de avance de la carrera, horas completadas
- [x] Horario con fusión de celdas por CSS Grid (BLUEPRINT.md sección 2.2)
- [x] Import/export CSV de materias
- [x] Panel de ayuda con el formato de columnas esperado del CSV

## Fase 2 — Productividad (2 semanas)

- [x] Tareas: vista Lista + Kanban con dnd-kit
- [x] Pomodoro anclado a la tarea activa
- [x] Calculadora de nota necesaria integrada a la ficha de Materia (BLUEPRINT.md sección 5)

## Fase 3 — Finanzas (2–3 semanas)

- [x] Movimientos (gasto/ingreso) + categorías
- [x] Suscripciones recurrentes con calendario de vencimientos
- [x] Reportes con Recharts (distribución por categoría, presupuesto vs. real)
- [x] Exportación Excel estilizada (ExcelJS) para Materias y Finanzas (BLUEPRINT.md sección 2.1)

## Fase 4 — Gastos compartidos (1–2 semanas)

- [x] Participantes y gastos con exclusión por ítem (BLUEPRINT.md sección 2.3)
- [x] Algoritmo de liquidación mínima
- [x] Vista "quién le debe a quién"

## Fase 5 — Pulido y PWA (1–2 semanas)

- [x] Modo oscuro/claro completo
- [x] Responsive mobile: barra inferior de 4 slots (BLUEPRINT.md sección 1)
- [x] Recordatorios nivel garantizado + nivel de mejor esfuerzo (BLUEPRINT.md sección 5)
- [x] `vite-plugin-pwa` configurado
- [x] `navigator.storage.persist()` solicitado al usuario
- [x] Instructivo de importación visible desde el módulo Académico

## Fase 7 — Hábitos y Entrenamiento

- [x] Rutina de split (5 días activos + descanso) con ejercicios planificados por día
- [x] Registro de sesiones: fuerza (series/reps/peso), triserie de core, cardio (tiempo/distancia)
- [x] Tracking nutricional diario: proteína objetivo/lograda y checkbox de creatina
- [x] `SCHEMA_VERSION_ACTUAL` v2→v3 con migración de backup correspondiente

## Fase 8 — Sincronización P2P por QR

- [x] Generar QR de un evento compartido (`qrcode` + `lz-string`)
- [x] Escanear un QR con la cámara (`qr-scanner`) y crear un evento nuevo con ids remapeados
- [x] Fallback a archivo `.json` para eventos que no entran en un QR
- [x] Todo el código de QR/cámara se carga con `import()` dinámico, fuera del bundle inicial

## Fase 9 — Temas y paletas

- [x] 3 paletas nuevas (Océano, Lila, Minimalista), cada una con su propio par claro/oscuro
- [x] Eje `paleta` independiente de `tema` — cero bump de schema, cero flash al cargar
- [x] Selector de paleta en Ajustes, isotipo de marca fijo en las 4 opciones

---

**Estado actual: 9 fases completas.**
