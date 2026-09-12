# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes que además trabajan (o cualquier persona con la vida repartida entre varios frentes) y necesitan organizar en un solo lugar lo académico, lo personal, lo financiero y los gastos compartidos con amigos, en vez de saltar entre cinco apps distintas (calendario, cuentas, Excel de la facultad, etc.). Poco tiempo disponible: valoran flujos rápidos (crear un bloque de horario con un click, un checkbox para completar una tarea) sobre configuración extensa.

## Product Purpose

Frakta es una SPA de organización académica y personal — horario, materias, tareas, finanzas y gastos compartidos — pensada para que el usuario deje de repartir su vida entre apps sueltas. Éxito significa que la persona pueda, desde un único dashboard, ver de un vistazo su próxima clase, tareas por vencer, gasto del mes y promedio académico, y resolver cada módulo sin fricción.

## Positioning

No hay backend: ni servidor, ni cuenta de usuario, ni login, ni una sola llamada de red para guardar datos. Todo vive en IndexedDB del propio navegador; el único mecanismo de respaldo es exportar/importar un `.json` a mano, del cual el usuario es dueño (no un tercero). Esto da privacidad total, cero latencia de red y funcionamiento offline — a cambio de la responsabilidad real de que borrar los datos del navegador sin backup los pierde para siempre, cosa que la app recuerda activamente en Ajustes (recordatorio de backup cada 14 días).

## Operating Context

- Formato numérico y de fechas en español/Argentina en toda la app (coma decimal, `;` como separador de CSV).
- Instalable como PWA, con funcionamiento offline del propio código.
- Uso en escritorio (sidebar colapsable) y en mobile (barra de navegación inferior de 4 slots: los tres módulos de consulta diaria + un "Más" con el resto).
- El usuario importa/exporta CSV de materias en el formato de columnas documentado en el propio panel de ayuda de Académico, y JSON completo de toda la app desde Ajustes.
- Gastos compartidos se dan en el contexto de eventos puntuales con amigos (un asado, un viaje) donde hay que excluir gente de gastos individuales y saldar deudas cruzadas al final.

## Capabilities and Constraints

- **Dashboard**: de solo lectura, cada widget resume su módulo y navega a él (Próxima clase, Tareas por vencer 48h, Gasto del mes vs. presupuesto, Promedio académico, Débitos automáticos próximos).
- **Académico**: CRUD de materias (año, carga horaria, estado, nota, correlativas, parciales dinámicos), métricas en vivo (promedio general, promedio sin aplazos, % de avance, horas completadas), calculadora "qué necesito para aprobar", import/export CSV (todo-o-nada, una fila inválida rechaza el archivo entero), export a Excel estilizado (ExcelJS).
- **Horario**: grilla semanal 07:00–23:00 en franjas de 30 min con fusión visual de bloques superpuestos calculada en cada render (nunca persistida); bloques pueden ser una materia guardada o una actividad libre con título e ícono propios (16 íconos curados); color por bloque.
- **Tareas**: vista Lista y Kanban (dnd-kit), tipo/prioridad/fecha límite, vínculo opcional a materia o a proyecto, Pomodoro anclado a la tarea activa; Proyectos con CRUD completo (crear/editar/borrar) y creación inline desde el propio formulario de tarea.
- **Finanzas**: movimientos (gasto/ingreso) con categoría libre autocompletada, suscripciones recurrentes con recorte de fin de mes, calendario de vencimientos, reportes (Recharts) con presupuesto por categoría, export a Excel estilizado.
- **Gastos compartidos**: eventos con participantes y gastos, exclusión por ítem, liquidación mínima de deudas (algoritmo goloso tipo Splitwise), vista "quién le debe a quién".
- **Ajustes**: tema claro/oscuro/automático sin parpadeo, backup JSON con migración de esquema versionada, recordatorios activables/desactivables (nivel garantizado + mejor esfuerzo vía Periodic Background Sync), almacenamiento persistente activable/desactivable, reinicio total de datos con confirmación por texto ("REINICIAR").
- **Restricción dura**: cero backend, cero red para persistencia. Cualquier feature nueva debe seguir viviendo enteramente en el cliente (IndexedDB vía Dexie.js).
- **Terminología del dominio**: "materia" (subject), "bloque" (schedule slot), "correlativa" (prerequisite subject), "parcial" (partial exam), "liquidación" (debt settlement).

## Brand Commitments

- Nombre: **Frakta**, de "fractal" — la idea de que organizando las cosas chicas (un gasto, una tarea, una celda del horario) se mantiene en orden el panorama grande. Esta historia de marca ya está escrita en el README y es parte de la identidad, no un detalle a reinventar.
- Logo existente en `public/logo.png`.
- Voz: cercana, directa, en español rioplatense/argentino (vos, tildes, jerga local como "laburan", "plata").

## Evidence on Hand

Sin usuarios externos todavía — es uso personal del propio desarrollador, con intención de compartirlo/publicarlo próximamente. No hay testimonios, casos de uso de terceros, métricas de uso real ni feedback documentado: no inventar ninguno de estos en trabajo futuro. El propio README (`README.md`) es la documentación funcional completa y confiable de cada módulo.

## Product Principles

1. **Local-first sin excepciones**: ninguna feature nueva depende de una llamada de red ni de una cuenta de usuario.
2. **Todo-o-nada en las importaciones**: un archivo (JSON, CSV o Excel) se valida entero contra su esquema antes de tocar un solo dato — nunca una carga parcial.
3. **Honestidad sobre los propios límites**: la app no promete capacidades que el entorno (navegador, PWA, permisos) no puede garantizar — mejor decir "mejor esfuerzo" que prometer algo que puede fallar en silencio.
4. **Fricción proporcional al riesgo**: acciones destructivas (reiniciar todos los datos) piden confirmación explícita por texto, no solo un click.
5. **Rapidez de flujo sobre configuración exhaustiva**: crear/editar debe poder hacerse en pocos clicks (click directo en celda de horario, checkbox para completar tarea) antes que ofrecer opciones exhaustivas de configuración.

## Accessibility & Inclusion

Sin requisitos puntuales confirmados más allá de buenas prácticas estándar: contraste razonable, navegación por teclado y componentes accesibles (la app ya usa Radix/shadcn como base).
