# Restricciones Operacionales — Aminas PWA

> **Diseño Estructurado Moderno.** Condiciones bajo las cuales el sistema debe operar, límites técnicos y reglas que restringen su uso.

---

## 1. Requisitos de operación

| # | Restricción | Detalle |
| :---: | :--- | :--- |
| R01 | **Dispositivo** | Celular, tableta o computadora con pantalla de al menos 360 px de ancho |
| R02 | **Navegador** | Versión actual de Chrome, Edge o Safari, con soporte de Service Worker, `localStorage` y módulos de JavaScript (ES6) |
| R03 | **Primera carga** | Requiere conexión **una sola vez** para descargar e instalar la aplicación; después funciona sin internet |
| R04 | **Publicación** | La aplicación debe servirse por **HTTPS** (o `localhost` en pruebas); de lo contrario no funciona el modo sin conexión |
| R05 | **Impresión** | Para imprimir o generar PDF del reporte se usa el diálogo de impresión del sistema operativo |
| R06 | **WhatsApp** | El resumen se copia al portapapeles; el envío lo hace el usuario desde WhatsApp |

## 2. Restricciones de datos y almacenamiento

| # | Restricción | Detalle |
| :---: | :--- | :--- |
| R07 | **Datos locales por dispositivo** | La información se guarda en el navegador del equipo; **no se comparte** entre dispositivos ni entre navegadores diferentes |
| R08 | **Capacidad** | El almacenamiento local del navegador tiene un límite aproximado de 5 MB por sitio (varía por navegador). Si se llena, el sistema avisa en consola y no guarda el último cambio |
| R09 | **Respaldo** | Borrar los datos de navegación o desinstalar la app elimina la información; no hay respaldo automático |
| R10 | **Sin servidor de datos** | Los datos de pacientes nunca se envían a internet |
| R11 | **Catálogo de fármacos fijo** | Los rangos terapéuticos solo se cambian modificando el código (son datos clínicos de referencia) |

## 3. Reglas de negocio que restringen la operación

| # | Regla | Dónde se aplica |
| :---: | :--- | :--- |
| R12 | Sin **peso** mayor a 0 no se calculan dosis ni fármaco | Calculadora (CU08) |
| R13 | No se calcula si la **velocidad** o el **volumen final** es 0 (evita divisiones entre cero) | Calculadora (CU08) |
| R14 | Los campos numéricos no aceptan valores negativos | Calculadora |
| R15 | Debe existir **al menos un paciente** registrado | Baja de paciente (CU05) |
| R16 | Un profesional no puede tener **dos citas activas** a la misma fecha y hora | Citas (CU18, CU19, CU22) |
| R17 | Solo se editan citas **Programadas** o **En consulta**; las Completadas y Canceladas son de solo lectura | Citas (CU19, CU20) |
| R18 | La **cédula profesional es única**; el nombre y la especialidad requieren mínimo 3 caracteres y la contraseña mínimo 3 | Usuarios (CU24, CU25) |
| R19 | Debe existir **al menos un Médico Pediatra**, y no se puede dar de baja al perfil que tiene el turno activo | Usuarios (CU26) |
| R20 | Los reportes del historial son **copias fijas**: solo se pueden editar sus observaciones | Historial (CU16) |
| R21 | Cada acción está limitada por **rol** según la matriz de permisos (por ejemplo, Recepción no usa la calculadora y solo el Médico Pediatra elimina pacientes y reportes) | Todo el sistema |

## 4. Restricciones de seguridad

| # | Restricción | Detalle |
| :---: | :--- | :--- |
| R22 | Acceso por perfil con contraseña | Cada cambio de turno pide la contraseña del profesional |
| R23 | Un solo turno activo por dispositivo | El profesional en turno firma todos los reportes emitidos en ese equipo |
| R24 | Alcance académico de la seguridad | Las contraseñas se guardan sin cifrar en el navegador y las cuentas de demostración muestran su contraseña. **Para uso real** se requiere cifrado de contraseñas y autenticación en servidor |

## 5. Restricciones de uso clínico

| # | Restricción |
| :---: | :--- |
| R25 | El sistema es una **herramienta de apoyo**: todo cálculo debe ser verificado por el personal de salud antes de programar la bomba, según los protocolos de la institución |
| R26 | La programación de la **bomba de infusión** es manual; el sistema no se conecta con dispositivos médicos |
| R27 | Los rangos terapéuticos mostrados son de referencia pediátrica general y no sustituyen la indicación médica |
