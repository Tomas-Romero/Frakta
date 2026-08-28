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

- [ ] Modo oscuro/claro completo
- [ ] Responsive mobile: barra inferior de 4 slots (BLUEPRINT.md sección 1)
- [ ] Recordatorios nivel garantizado + nivel de mejor esfuerzo (BLUEPRINT.md sección 5)
- [ ] `vite-plugin-pwa` configurado
- [ ] `navigator.storage.persist()` solicitado al usuario
- [ ] Instructivo de importación visible desde el módulo Académico

---

**Estado actual: Fases 0 a 4 completas. Fase 5 (Pulido y PWA) sin empezar.**
