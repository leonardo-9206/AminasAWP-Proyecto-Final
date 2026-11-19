# Lista de Eventos — Aminas PWA

> **Análisis Estructurado Moderno · Modelo Ambiental.** Acontecimientos del entorno a los que el sistema debe responder. Cada evento indica su **estímulo** (flujo de entrada), la **respuesta** del sistema (flujo de salida o cambio en un almacén) y el **proceso** del DFD que lo atiende. Los nombres de flujos y almacenes son los del Diccionario de Datos.

**Tipos de evento**
- **F — Orientado a flujo:** ocurre cuando llega un dato del exterior (el usuario captura algo).
- **T — Temporal:** ocurre en un momento determinado (fecha u hora).
- **C — De control:** ocurre por un cambio de condición del entorno, sin datos de negocio.

---

## 1. Eventos orientados a flujo

| # | Evento | Tipo | Estímulo (entrada) | Respuesta del sistema | Proceso |
| :---: | :--- | :---: | :--- | :--- | :---: |
| E01 | El profesional inicia o cambia su turno | F | `credenciales_turno` | Guarda `usuario_en_turno` en D6 y aplica sus permisos; si la contraseña es incorrecta, `mensaje_error` | 7.2 |
| E02 | El administrador registra a un profesional | F | `datos_profesional` | Agrega `profesional` a D5 e inicia su turno; si hay errores (cédula repetida, contraseña), `mensaje_error` | 7.3 |
| E03 | El administrador modifica a un profesional | F | `id_profesional` + `datos_profesional` | Actualiza `profesional` en D5 (y D6 si es el perfil en turno) | 7.4 |
| E04 | El administrador da de baja a un profesional | F | `id_profesional` + `confirmacion` | Elimina de D5; rechaza si es el perfil en turno o el último Médico Pediatra | 7.5 |
| E05 | El usuario consulta los perfiles del personal | F | `accion_usuario` | `lista_profesionales` | 7.6 |
| E06 | El médico registra un paciente | F | `accion_paciente` (Alta) | Crea `paciente` en D1 con las `infusiones_predeterminadas` en D2 | 2.2 |
| E07 | El personal modifica nombre o peso del paciente | F | `datos_paciente` | Actualiza D1 y recalcula todas las infusiones | 2.4 |
| E08 | El médico elimina un paciente | F | `id_paciente` + `confirmacion` | Elimina de D1 y D2; rechaza si es el único paciente | 2.3 |
| E09 | El usuario consulta los pacientes | F | `accion_paciente` (Consulta) | `resumen_pacientes` (dashboard) | 2.5 |
| E10 | El personal agrega una infusión | F | `parametros_infusion` (Agregar) | Nueva `infusion` en D2 | 3.2 |
| E11 | El personal quita una infusión | F | `indice_infusion` | Elimina la `infusion` de D2 | 3.3 |
| E12 | El personal captura la dosis deseada | F | `parametros_infusion` (dosis, diluyente o unidad) | `cantidad_farmaco` a diluir y `equivalencias` | 3.4, 3.6 |
| E13 | El personal captura la velocidad de la bomba o el fármaco | F | `parametros_infusion` (velocidad o fármaco) | `dosis_real` y `equivalencias` | 3.5, 3.6 |
| E14 | El personal proyecta una Velocidad 2 | F | `parametros_infusion` (velocidad 2) | `equivalencias` (Equivalencia 2) | 3.6 |
| E15 | El personal escribe el nombre de un fármaco | F | `nombre_farmaco` | `rango_y_color` y `decimales` | 4 |
| E16 | El personal solicita el reporte de entrega de guardia | F | `accion_reporte` (Generar) | `ficha_reporte` | 5.2 |
| E17 | El personal guarda el reporte en el historial | F | `observaciones_reporte` | `registro_reporte` en D7 con folio | 5.3 |
| E18 | El usuario consulta el historial de reportes | F | `texto_busqueda` | `lista_reportes` | 5.4 |
| E19 | El personal corrige las observaciones de un reporte | F | `folio` + `observaciones_reporte` | Actualiza `registro_reporte` en D7 | 5.5 |
| E20 | El médico elimina un reporte | F | `folio` + `confirmacion` | Elimina de D7 | 5.6 |
| E21 | El personal imprime o comparte el reporte | F | `accion_reporte` (Imprimir / WhatsApp) | `reporte_impreso` o `texto_whatsapp` | 5.7 |
| E22 | El usuario agenda una cita | F | `datos_cita` | `cita` en D4 con estado PROGRAMADA; si falta un dato o hay empalme, `mensaje_error` | 6.2 |
| E23 | El usuario edita o reprograma una cita | F | `id_cita` + `datos_cita` | Actualiza `cita` en D4 (suma una reprogramación si cambió fecha u hora) | 6.3 |
| E24 | El médico o residente atiende o concluye una cita | F | `id_cita` + `nuevo_estado` | `estado_cita` EN_CURSO o COMPLETADA en D4 | 6.4 |
| E25 | El usuario cancela una cita | F | `id_cita` + `nuevo_estado` + `confirmacion` | `estado_cita` CANCELADA en D4 (libera el horario) | 6.4 |
| E26 | El usuario elimina una cita | F | `id_cita` + `confirmacion` | Elimina de D4 | 6.5 |
| E27 | El usuario consulta o filtra la agenda | F | `filtro_citas` | `agenda_citas` | 6.6 |
| E28 | El usuario elige una opción del menú | F | `OPC` | Activa el módulo correspondiente o `rechazo` | 1 |

## 2. Eventos de control

| # | Evento | Tipo | Estímulo | Respuesta del sistema |
| :---: | :--- | :---: | :--- | :--- |
| C01 | El dispositivo pierde la conexión a internet | C | Señal `offline` del navegador | La insignia cambia a "🟡 Sin Conexión (Offline)"; la app sigue funcionando desde caché |
| C02 | El dispositivo recupera la conexión | C | Señal `online` del navegador | La insignia vuelve a "🟢 Modo Offline Listo" |
| C03 | Se publica una nueva versión de la aplicación | C | Nuevo Service Worker (`aminas-pwa-v16` → `v17`) | Descarga los archivos nuevos y borra la caché anterior |
| C04 | Un usuario sin permiso intenta una acción restringida | C | Rol del usuario en turno (D6) | La acción se bloquea con "🔒 Acción no permitida" y no se modifica ningún almacén |

## 3. Eventos temporales

El sistema **no ejecuta procesos automáticos programados** (no hay recordatorios ni cierres de día). La fecha y la hora intervienen así:

| # | Evento | Tipo | Estímulo | Respuesta del sistema |
| :---: | :--- | :---: | :--- | :--- |
| T01 | Cambia el día calendario | T | Fecha del dispositivo | Al mostrar el dashboard o la agenda, el contador **"Citas para hoy"** se calcula con la fecha actual |
| T02 | Llega la hora de una cita programada | T | Fecha y hora de la cita | No hay aviso automático: la cita sigue PROGRAMADA hasta que un médico pulsa *Atender* (decisión de diseño para que el estado refleje la atención real) |
