<p align="center">
  <img src="public/logo.png" alt="Frakta" width="140" />
</p>

<h1 align="center">Frakta</h1>

<p align="center">
  <em>De "fractal": la idea de que organizando las cosas chicas —un gasto del día, una tarea, una celda del horario— se mantiene en orden el panorama gigante.</em>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white">
  <img alt="Dexie" src="https://img.shields.io/badge/Dexie.js-IndexedDB-4f7a62">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-instalable-8fbfa0">
  <img alt="Backend" src="https://img.shields.io/badge/backend-ninguno-c7a24a">
</p>

---

## ¿Qué es esto?

Frakta es una SPA (single-page app) de organización académica y personal: horario, materias, tareas, finanzas y gastos compartidos con amigos, todo en un mismo lugar. Está pensada para estudiantes que además laburan, o para cualquiera que quiera dejar de repartir su vida entre cinco apps distintas (una para el calendario, otra para las cuentas, otra para el Excel de la facultad...).

La particularidad más grande no es una feature puntual, sino una decisión de arquitectura: **no hay backend**. No hay servidor, no hay cuenta de usuario, no hay login, no hay ninguna llamada de red para guardar tus datos. Todo lo que cargás vive en el propio navegador, en IndexedDB. El único mecanismo de respaldo es exportar/importar un archivo `.json` a mano — vos sos dueño del archivo, no un servidor de un tercero.

Eso trae ventajas reales (privacidad total, cero latencia de red, funciona sin conexión) y también una responsabilidad real: si borrás los datos del navegador sin haber exportado un backup, se pierden. La app te lo recuerda activamente en Ajustes.

## ¿Para qué sirve?

Frakta se organiza en un dashboard de entrada, cinco módulos de contenido y una pantalla de ajustes, todo accesible desde la barra lateral. Esta es la lista completa y detallada de lo que hace cada uno:

### 📊 Dashboard

Pantalla de entrada, **de solo lectura** — ningún widget tiene un formulario propio, todos llevan a su módulo con un click:

- **Próxima clase**: calcula cuál es tu próximo bloque de horario desde el momento actual, recorriendo hasta 7 días hacia adelante ("Hoy 14:00", "Mañana 09:00", "Miércoles 09:00"...).
- **Tareas por vencer (48 h)**: cuántas tareas no completadas vencen en las próximas 48 horas y cuál es la más próxima.
- **Gasto del mes vs. presupuesto**: cuánto gastaste este mes contra el total presupuestado (si configuraste alguno).
- **Promedio académico**: tu promedio general actual, en la escala de notas que elegiste (1-10 o 0-100).
- **Débitos automáticos próximos**: qué suscripciones recurrentes vencen en los próximos 7 días.

### 🎓 Académico

- **CRUD de materias**: nombre, año de cursada, carga horaria (semanal y total), estado (`PorCursar` / `Cursando` / `Regular` / `Aprobado`), nota, correlativas (elegidas de las demás materias cargadas) y una lista dinámica de parciales (cada uno con su propio nombre, nota y peso).
- **Métricas en vivo**: promedio general, promedio *sin aplazos* (excluye las notas por debajo del umbral de aprobación de tu escala), porcentaje de avance de la carrera (aprobadas sobre el total) y horas totales completadas.
- **Calculadora "¿Qué necesito para aprobar?"**: le decís qué nota querés sacar en la materia y, con tus parciales ya cargados, te dice qué nota necesitás en el final. Si con el final no alcanza mecánicamente, revisa si tenés un parcial pendiente y te dice qué nota mínima ahí lo haría posible.
- **Import/export CSV** en formato argentino (`;` como separador, coma decimal) con un botón de ayuda visible que muestra el formato exacto de columnas esperado. Un archivo con una sola fila inválida se rechaza **entero** — nunca se carga una mezcla parcial.
- **Exportación a Excel estilizado** (colores de fondo por estado, columnas congeladas, autofiltro) usando ExcelJS.

### 🗓️ Horario

- Grilla semanal completa, de 07:00 a 23:00 en franjas de 30 minutos, construida con CSS Grid puro.
- **Fusión visual de bloques superpuestos** sin guardar ningún dato de "esto está fusionado": el layout (fila, carril, ancho, posición) se recalcula en cada render a partir únicamente de la hora de inicio y fin de cada bloque, con un algoritmo de barrido goloso (interval partitioning) — el mismo enfoque que usa Google Calendar para acomodar eventos que se pisan.
- Crear un bloque nuevo es un click directo sobre una celda vacía de la grilla (precarga el día y la hora); editar o borrar se hace clickeando el bloque existente.
- Color por bloque, con una paleta rápida de un click o un selector de color libre.

### ✅ Tareas

- **Vista Lista**: ordenada por fecha límite y prioridad, con un checkbox de un click para marcar como completada y las fechas vencidas resaltadas.
- **Vista Kanban**: tres columnas (Por hacer / En progreso / Completado) con arrastrar-y-soltar real (dnd-kit) para cambiar el estado.
- Tipo de tarea (académica / personal / proyecto / idea), prioridad (alta / media / baja), fecha límite opcional, y un vínculo opcional a una materia o a un proyecto.
- **Pomodoro**: un widget flotante y minimizable, anclado a la tarea que elijas ("enfocar"). Ciclo automático de 25 minutos de trabajo → 5 de descanso → vuelta a trabajo (en pausa, esperando que arranques la próxima), sumando el contador de pomodoros completados de esa tarea.

### 💰 Finanzas

- **Movimientos** (gasto o ingreso) con categoría libre — con autocompletado de las categorías que ya usaste antes —, fecha y descripción.
- **Suscripciones recurrentes**: nombre, monto, día del mes en que se debita (con recorte automático a fin de mes: una suscripción del "día 31" cae el 28/29 de febrero) y si está activa o no.
- **Calendario mensual de vencimientos**: navegable mes a mes, marca visualmente qué días tenés débitos programados.
- **Reportes** (Recharts): resumen de ingresos/gastos/balance del mes, gráfico de torta de gastos por categoría, y un gráfico de barras de presupuesto vs. gasto real por categoría — con un editor de presupuesto mensual integrado ahí mismo.
- **Exportación a Excel estilizado** de los movimientos, con colores por tipo (gasto/ingreso).

### 🤝 Gastos compartidos

- Creá un "evento" (un asado, un viaje, lo que sea) con una lista de participantes y una lista de gastos.
- Cada gasto tiene su propia lista de "quién pagó" y "quién participa" — **excluir a alguien de un gasto puntual es simplemente no tildarlo** ahí (si alguien no toma alcohol, no se lo incluye en la birra y listo, sin ninguna lógica especial de exclusión).
- **Liquidación mínima**: un algoritmo goloso (el mismo enfoque que usa Splitwise) reduce todas las deudas cruzadas a la menor cantidad de transferencias posible — como mucho *N-1* transferencias para *N* personas.
- Vista **"quién le debe a quién"**: el balance neto de cada participante y la lista concreta de transferencias sugeridas para saldar todo.

### ⚙️ Ajustes

- **Apariencia**: tema claro, oscuro o automático (según el sistema operativo), sin parpadeo al cargar la página.
- **Backup**: exportar/importar un `.json` con *todos* los datos de la app. Las importaciones pasan por una migración de esquema versionada y una validación completa antes de tocar un solo dato — si algo no cierra, se rechaza el archivo entero.
- **Recordatorios**: nivel garantizado (mientras la app está abierta revisa tareas y suscripciones por vencer, al abrir, al volver a la pestaña y cada 15 minutos, y dispara notificaciones del navegador) + nivel de mejor esfuerzo (un intento de aviso en segundo plano vía Periodic Background Sync, solo si instalaste la PWA en Chrome/Android — sin prometer nada ahí donde el navegador no lo soporta).
- **Almacenamiento persistente**: le pide al navegador que no borre los datos guardados si el disco se queda sin espacio.

### Transversal a toda la app

- **100% local-first**: todo vive en IndexedDB vía Dexie.js. Cero llamadas de red para persistir nada.
- **Instalable como PWA**, con ícono, manifest y funcionamiento offline del propio código de la app.
- **Responsive de verdad**: sidebar colapsable en escritorio, barra de navegación inferior de 4 slots en mobile (los tres módulos de consulta diaria + un "Más" con el resto).
- Formato numérico y de fechas en español/Argentina en toda la app (coma decimal, `;` como separador de CSV).

## ¿Qué tecnologías usa?

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | **React 19 + TypeScript + Vite** | Tipado fuerte para los esquemas de datos, build instantáneo, ecosistema amplio. |
| Persistencia | **Dexie.js** sobre IndexedDB | API con promesas sobre el verboso IndexedDB nativo; `dexie-react-hooks` re-renderiza la UI sola cuando cambian los datos. |
| Estado de UI | **Zustand** | Solo para lo que no es dato persistente (pestaña activa, sidebar colapsada, timer del Pomodoro). Los datos de negocio nunca viven acá. |
| Estilos | **Tailwind CSS v4 + shadcn/ui** (Radix) | Componentes accesibles por defecto, modo oscuro vía clase, tema de marca por variables CSS. |
| Drag & drop | **dnd-kit** | Accesible por teclado, usado en el Kanban de Tareas. |
| Gráficos | **Recharts** | Torta y barras de Finanzas. |
| Excel | **ExcelJS** + file-saver | A diferencia de SheetJS, escribe estilos de celda (colores, rellenos) sin necesitar una licencia paga. |
| CSV | **PapaParse** | Detección robusta de delimitador y manejo de comillas/encoding. |
| Fechas | **date-fns** | Tree-shakeable — solo se empaqueta lo que se usa. |
| Validación | **Zod + React Hook Form** | El mismo esquema valida formularios *y* los archivos importados (JSON/CSV) antes de tocar la base local. |
| PWA | **vite-plugin-pwa** | Service worker propio (`injectManifest`) con precache del código y un handler de Periodic Background Sync. |

## ¿Cómo lo veo funcionando? (live demo)

Todavía no hay una demo pública desplegada. Como es una SPA 100% del lado del cliente (sin backend, sin variables de entorno, sin base de datos remota), se podría desplegar tal cual a un host estático — Vercel, Netlify o GitHub Pages — con solo apuntarlo al comando `npm run build` y servir la carpeta `dist/`. Si querés, pedímelo y lo dejamos andando.

Mientras tanto, la sección de abajo te levanta el proyecto local en menos de un minuto.

## ¿Cómo lo corro en mi máquina?

**Requisitos**: Node.js 20 o superior y npm. Nada más — no hay backend que levantar, ni variables de entorno, ni base de datos que configurar.

```bash
git clone https://github.com/Tomas-Romero/Frakta.git
cd Frakta
npm install
npm run dev
```

Abrí `http://localhost:5173`. Los datos que cargues quedan en el IndexedDB de tu propio navegador — nada sale de tu máquina.

Otros comandos disponibles:

```bash
npm run build     # build de producción (tsc -b && vite build) en dist/
npm run preview   # sirve ese build localmente para probarlo
npm run lint      # oxlint
```

## ¿Qué partes interesantes tiene?

- **El horario no guarda su propio layout.** La fusión visual de bloques que se pisan en el tiempo (dos comisiones superpuestas, por ejemplo) no es un dato — es el resultado de un algoritmo de barrido goloso (interval partitioning) que corre en cada render a partir de `horaInicioMin`/`horaFinMin`. Nunca hay un flag de "celda fusionada" que se pueda desincronizar del dato real. Ver [`layoutSemana.ts`](src/features/horario/layoutSemana.ts).
- **La liquidación de gastos compartidos** reduce un problema que en su forma exacta es NP-difícil (partición de subconjuntos) a un algoritmo goloso de `O(N log N)` que empareja en cada paso al mayor acreedor con el mayor deudor — el mismo truco que usa Splitwise. Da como mucho *N-1* transferencias y en la práctica coincide con el óptimo casi siempre. Ver [`liquidar.ts`](src/features/gastos-compartidos/liquidar.ts).
- **Todo import es todo-o-nada.** JSON, CSV o Excel: el archivo entero se valida contra un esquema Zod *antes* de que se escriba la primera fila en Dexie. Una fila inválida en medio de 200 rechaza las 200, nunca deja una carga a medias.
- **La app ya tiene una migración de esquema real en producción propia.** Cuando se agregó la entidad `Presupuesto` (necesaria para el reporte de presupuesto vs. real), el número de versión de Dexie subió de 1 a 2 y se escribió la primera migración de verdad en `migrarBackup()` — probada de punta a punta contra un backup viejo sintético para asegurarse de que nadie pierde datos por actualizar la app.
- **Sin flash de tema oscuro/claro.** Como la preferencia real vive en Dexie (que carga async), un script mínimo e inline en `index.html` lee un caché en `localStorage` y aplica la clase `dark` *antes* de que React monte nada — evita el parpadeo típico de las apps que resuelven el tema después del primer render.
- **Recordatorios honestos sobre sus propios límites.** Sin backend no existe push garantizado con la app cerrada en todos los navegadores. Por eso hay dos niveles bien separados: uno garantizado (mientras la pestaña está abierta) y uno de mejor esfuerzo (Periodic Background Sync desde un service worker propio, que solo funciona en Chrome/Android con la PWA instalada) — y la interfaz nunca promete el segundo nivel como si fuera el primero.
- **ExcelJS en vez de SheetJS.** La edición gratuita de SheetJS no puede escribir estilos de celda (colores, rellenos) sin la versión paga; ExcelJS sí, de forma nativa — por eso las exportaciones de Materias y Finanzas se ven como una planilla real y no como texto plano con extensión `.xlsx`.
- **Los módulos pesados no viajan en el bundle inicial.** ExcelJS y Recharts se cargan con `import()` dinámico recién cuando el usuario aprieta "Exportar Excel" o abre la pestaña de Reportes — el bundle principal quedó en ~230 KB gzip en vez de cargar de entrada las ~370 KB extra que pesan esas dos librerías juntas.
