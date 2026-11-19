# Diagramas de Clases Detalladas — Aminas PWA

> **Análisis Orientado a Objetos.** Clases reales del sistema final (rama `develop`, commit `585b050`), con atributos, tipos, visibilidad y métodos tal como están en el código.
> Las relaciones entre clases se detallan en [`06_relaciones_entre_clases.md`](06_relaciones_entre_clases.md).

---

## 0. Notación

| Símbolo | Significado |
| :---: | :--- |
| `+` | Público |
| `-` | Privado / de uso interno de la clase |
| `método()$` | Método **estático** (de clase): se usa sin crear objetos, p. ej. `AgendaService.validarCita()` |
| `<<entity>>` | Clase de **entidad**: datos que se guardan en `localStorage` |
| `<<enumeration>>` | Conjunto fijo de valores |
| `<<service>>` | Clase de **lógica de negocio** (reglas del dominio) |
| `<<utility>>` | Módulo de **funciones puras** (no guarda estado) |
| `<<control>>` | **Controlador**: atiende eventos de la interfaz y coordina servicios |
| `<<repository>>` | Acceso a datos (patrón Repositorio) |
| `<<boundary>>` | **Vista**: genera el HTML que ve el usuario |

**Organización en capas** (ver [`10_arquitectura_en_capas.md`](10_arquitectura_en_capas.md)): Presentación (`js/ui`) → Controladores (`js/controllers`) → Dominio (`js/core`) → Persistencia (`js/data`).

---

## 1. Clases de entidad (modelo de dominio)

Son los objetos que el sistema guarda. En JavaScript se representan como objetos JSON; sus reglas de negocio viven en las clases de servicio (siguiente apartado).

```mermaid
classDiagram
    direction LR

    class EstadoAplicacion {
        <<entity>>
        +int activePatientId
        +int nextPatientId
        +Paciente[] patients
    }

    class Paciente {
        <<entity>>
        +int id
        +string name
        +float peso
        +Infusion[] meds
    }

    class Infusion {
        <<entity>>
        +string nombre
        +float dosis
        +UnidadDosis unidad
        +float farmaco
        +UnidadFarmaco farmaco_unidad
        +float diluyente
        +float vol_final
        +float velocidad
        +float equiv
        +UnidadDosis equiv_unidad
        +float velocidad2
        +float equiv2
        +UnidadDosis equiv_unidad2
    }

    class InfoFarmaco {
        <<entity>>
        +string clave
        +string color
        +string range
    }

    class Cita {
        <<entity>>
        +int id
        +int pacienteId
        +string pacienteNombre
        +string medicoResponsable
        +date fecha
        +time hora
        +string motivo
        +string notas
        +EstadoCita estado
        +int reprogramaciones
        +datetime fechaRegistro
        +datetime fechaModificacion
    }

    class Profesional {
        <<entity>>
        +int id
        +string nombre
        +string cedula
        +RolHospitalario rol
        +string rolLabel
        +string especialidad
        +string avatar
        +string turno
        -string password
        +datetime fechaRegistro
        +datetime fechaModificacion
    }

    class RegistroReporte {
        <<entity>>
        +int id
        +int pacienteId
        +string pacienteNombre
        +float peso
        +Infusion[] infusiones
        +string notas
        +Emisor emisor
        +datetime fechaEmision
        +datetime fechaModificacion
    }

    class Emisor {
        <<entity>>
        +int id
        +string nombre
        +string cedula
        +string rolLabel
    }

    class RolHospitalario {
        <<enumeration>>
        MEDICO_PEDIATRA
        RESIDENTE
        ENFERMERO_A
        RECEPCION
    }

    class EstadoCita {
        <<enumeration>>
        PROGRAMADA
        EN_CURSO
        COMPLETADA
        CANCELADA
    }

    class UnidadDosis {
        <<enumeration>>
        MCG_KG_MIN
        MCG_KG_H
        MG_KG_H
    }

    class UnidadFarmaco {
        <<enumeration>>
        MG
        MCG
    }

    EstadoAplicacion "1" *-- "1..*" Paciente : patients
    Paciente "1" *-- "0..*" Infusion : meds
    Infusion "0..*" ..> "0..1" InfoFarmaco : consulta
    Infusion --> UnidadDosis
    Infusion --> UnidadFarmaco
    Cita "0..*" --> "0..1" Paciente : pacienteId
    Cita "0..*" --> "1" Profesional : medicoResponsable
    Cita --> EstadoCita
    Profesional --> RolHospitalario
    RegistroReporte "1" *-- "0..*" Infusion : infusiones
    RegistroReporte "1" *-- "0..1" Emisor : emisor
```

| Clase | Responsabilidad | Dónde se guarda |
| :--- | :--- | :--- |
| **EstadoAplicacion** | Contenedor de todos los pacientes y del paciente activo; genera el siguiente id | `aminas_pwa_data` |
| **Paciente** | Paciente pediátrico con su peso (base de todos los cálculos) | dentro de `EstadoAplicacion.patients` |
| **Infusion** | Línea de fármaco intravenoso: dosis, dilución, velocidad y equivalencias | dentro de `Paciente.meds` |
| **UnidadDosis / UnidadFarmaco** | Valores permitidos: `mcg/kg/min`, `mcg/kg/h`, `mg/kg/h` y `mg`, `mcg` (en el diagrama se escriben como MCG_KG_MIN, etc.) | atributos de Infusion |
| **InfoFarmaco** | Referencia clínica: color pastel y rango terapéutico pediátrico | constante `medInfo` (solo lectura) |
| **Cita** | Cita o control clínico con su ciclo de estados | `aminas_citas_data` |
| **Profesional** | Usuario del sistema con rol, cédula, turno y contraseña | `aminas_usuarios_data` (y el activo en `aminas_auth_data`) |
| **RegistroReporte** | Copia fija (*snapshot*) de una entrega de guardia | `aminas_historial_data` |
| **Emisor** | Datos del profesional que firmó el reporte (sin contraseña) | dentro de `RegistroReporte` |

---

## 2. Clases de servicio (lógica de negocio · `js/core`)

<div class="grid-clases">

```mermaid
classDiagram
    class AgendaService {
        <<service>>
        +validarCita(datos) ResultadoValidacion$
        +buscarEmpalme(citas, cita, excluirId) Cita$
        +obtenerMedicosDisponibles(usuarios) string[]$
        +generarSiguienteId(citas) int$
        +filtrarCitas(citas, filtro) Cita[]$
        +contarCitasHoy(citas) int$
    }
```

```mermaid
classDiagram
    class AuthService {
        <<service>>
        +getUsuariosPredefinidos() Profesional[]$
        +validarPassword(usuario, password) bool$
        +validarNuevoUsuario(datos, usuarios, opciones) ResultadoValidacion$
        +crearUsuario(datos, usuarios) Profesional$
        +actualizarUsuario(usuario, datos) Profesional$
        +validarBajaUsuario(id, usuarios, idActivo) ResultadoValidacion$
        +formatearFirmaProfesional(usuario) string$
    }
```

```mermaid
classDiagram
    class PermisosService {
        <<service>>
        +Map MATRIZ_PERMISOS$
        +puede(usuario, accion) bool$
        +mensajeDenegado(usuario) string$
    }
```

```mermaid
classDiagram
    class HistorialService {
        <<service>>
        +generarSiguienteId(reportes) int$
        +crearRegistro(datos, reportes) RegistroReporte$
        +aPaciente(registro) Paciente$
        +filtrar(reportes, busqueda) RegistroReporte[]$
    }
```

```mermaid
classDiagram
    class CalculoFisiologico {
        <<utility>>
        +getDecimals(nombreFarmaco, decimalesDefecto) int$
        +calculateFarmacoMg(params) float$
        +calculateFarmacoDisplay(params) float$
        +calculateDosis(params) float$
        +calculateEquivalenceBySpeed(params) float$
    }
```

```mermaid
classDiagram
    class CatalogoMedicamentos {
        <<utility>>
        +Map medInfo$
        +Infusion[] defaultMeds$
        +getMedInfo(nombre) InfoFarmaco$
    }
```

```mermaid
classDiagram
    class ResultadoValidacion {
        +bool valido
        +string[] errores
    }
```

```mermaid
classDiagram
    class Accion {
        <<enumeration>>
        CALCULADORA_USAR
        PACIENTE_ALTA
        PACIENTE_BAJA
        REPORTE_GENERAR
        HISTORIAL_ELIMINAR
        CITA_AGENDAR
        CITA_ATENDER
        CITA_CANCELAR
        USUARIO_GESTIONAR
    }
```

</div>

| Clase | Archivo | Responsabilidad principal |
| :--- | :--- | :--- |
| **AgendaService** | `agendaService.js` | Reglas de citas: campos obligatorios, **no empalme**, filtros, contadores, lista de profesionales |
| **AuthService** | `authService.js` | Reglas de usuarios: contraseña, alta, cambio y baja (cédula única, mínimo 1 Médico Pediatra) |
| **PermisosService** | `permisosService.js` | Matriz de control de acceso por rol (RBAC) |
| **HistorialService** | `historialService.js` | Crea y filtra los snapshots del historial de reportes |
| **CalculoFisiologico** | `calculoFisiologico.js` | **Núcleo matemático**: dosis ↔ fármaco ↔ velocidad, equivalencias y decimales |
| **CatalogoMedicamentos** | `catalogoMedicamentos.js` | Catálogo de fármacos, rangos seguros, colores e infusiones predeterminadas |

---

## 3. Clases de control (`js/controllers` y `js/main.js`)

Cada controlador además guarda referencias a sus elementos HTML (botones, campos); por claridad aquí solo se muestran los atributos de **estado**.

<div class="grid-clases">

```mermaid
classDiagram
    class Main {
        <<control>>
        -string currentView
        -showView(nombreVista) void
        -puedeUsarCalculadora(avisar) bool
    }
```

```mermaid
classDiagram
    class AuthController {
        <<control>>
        -Profesional[] usuarios
        -Profesional activeUser
        -Profesional pendingUser
        -int editingUserId
        -string currentView
        -Function onUserChanged
        +init() void
        +open() void
        +close() void
        +showView(vista) void
        +renderProfilesList() void
        +handleSelectProfile(userId) void
        +handleVerifyPassword() void
        +handleRegisterDoctor() void
        +handleEditProfile(userId) void
        +handleUpdateDoctor() void
        +handleDeleteProfile(userId) void
        +switchActiveUser(usuario) void
        +getActiveUser() Profesional
        -updateRegisterFormMode(usuario) void
        -leerFormularioDoctor() Object
        -renderUserPill() void
    }
```

```mermaid
classDiagram
    class DashboardController {
        <<control>>
        -int activePatientId
        -Function onSelectPatient
        -Function onNewPatient
        -Function onNavigateToCitas
        -Function onNavigateToHistorial
        +init() void
        +render() void
        -setupEventListeners() void
        -updateNetworkStatus() void
    }
```

```mermaid
classDiagram
    class CalculadoraController {
        <<control>>
        -EstadoAplicacion appState
        -Function onBackToDashboard
        -Function onGenerarReporte
        -Function onNavigateToCitas
        +init(opciones) void
        +openPatient(idPaciente) void
        +addNewPatientAndOpen() void
        +applyPermissions() void
        +getActivePatientData() Paciente
        +saveState() void
        +createNewPatient() void
        +deleteCurrentPatient() void
        +switchPatient(id) void
        +addRow(infusion) void
        +recalculateAllRows() void
        -renderTabs() void
        -renderActivePatient() void
        -applyMedStyles(fila) void
        -attachRowEvents(fila) void
        -updateRowBaseCalculations(fila) void
        -calculateFarmaco(fila) void
        -calculateDose(fila) void
        -updateEquivalencias(fila) void
        -updateEquivalencia1(fila) void
        -updateEquivalencia2(fila) void
        -verificarPermiso(accion) bool
    }
```

```mermaid
classDiagram
    class ReporteController {
        <<control>>
        -Paciente currentPatient
        -Infusion[] activeMeds
        -Profesional activeUser
        -Date emissionDate
        -int registroHistorialId
        -Function onHistorialChanged
        +open(paciente, usuario) void
        +openFromHistorial(registro) void
        +close() void
        +saveToHistorial() void
        +copyWhatsAppSummary() void
        -renderModal(notas, folio) void
        -getCustomNotes() string
        -showToast(mensaje, exito) void
    }
```

```mermaid
classDiagram
    class HistorialController {
        <<control>>
        -RegistroReporte[] reportes
        -string busqueda
        -Function onNavigateToDashboard
        -Function onOpenReporte
        +init() void
        +render() void
        +handleOpen(folio) void
        +handleDelete(folio) void
        -renderList() void
    }
```

```mermaid
classDiagram
    class CitasController {
        <<control>>
        -Cita[] citas
        -string filtroEstadoActual
        -string busquedaActual
        -int editingCitaId
        -Map nombresPacientes
        -Function onNavigateToDashboard
        -Function onNavigateToCalculadora
        +init() void
        +render() void
        +handleSaveCita() void
        +handleEditCita(idCita) void
        +handleChangeState(idCita, nuevoEstado) void
        +handleDeleteCita(idCita) void
        -leerFormulario() Object
        -openForm() void
        -closeForm() void
        -updateFormMode() void
        -nombrePaciente(cita) string
        -puede(accion) bool
        -renderList() void
    }
```

</div>

| Clase | Casos de uso que atiende |
| :--- | :--- |
| **Main** (`main.js`) | Navegación entre vistas y bloqueo de la calculadora por rol |
| **AuthController** | CU01, CU24, CU25, CU26 |
| **DashboardController** | CU02 (y dispara CU03) |
| **CalculadoraController** | CU03 a CU10 |
| **ReporteController** | CU11 a CU14 y CU16 |
| **HistorialController** | CU15 y CU17 |
| **CitasController** | CU18 a CU23 |

---

## 4. Clase de persistencia (`js/data`)

```mermaid
classDiagram
    class StorageRepository {
        <<repository>>
        +Map STORAGE_KEYS$
        +loadAppState(defaultMeds) EstadoAplicacion$
        +saveAppState(estado) bool$
        +loadCitas() Cita[]$
        +saveCitas(citas) bool$
        +loadUsuarios(predeterminados) Profesional[]$
        +saveUsuarios(usuarios) bool$
        +getActiveUser() Profesional$
        +setActiveUser(usuario) void$
        +loadHistorial() RegistroReporte[]$
        +saveHistorial(reportes) bool$
    }
```

| Clave de `localStorage` | Método de lectura | Método de escritura | Entidad |
| :--- | :--- | :--- | :--- |
| `aminas_pwa_data` | `loadAppState` | `saveAppState` | EstadoAplicacion → Paciente → Infusion |
| `aminas_citas_data` | `loadCitas` | `saveCitas` | Cita |
| `aminas_usuarios_data` | `loadUsuarios` | `saveUsuarios` | Profesional |
| `aminas_auth_data` | `getActiveUser` | `setActiveUser` | Profesional (en turno) |
| `aminas_historial_data` | `loadHistorial` | `saveHistorial` | RegistroReporte |

Todos los métodos de escritura capturan errores (p. ej. almacenamiento lleno) y regresan `false` en lugar de detener la aplicación.

---

## 5. Clases de vista (`js/ui`)

<div class="grid-clases">

```mermaid
classDiagram
    class DashboardView {
        <<boundary>>
        +getActiveInfusions(paciente) Infusion[]
        +renderMedChipsHtml(infusiones) string
        +renderPatientCardHtml(paciente, esActivo) string
        +renderEmptyPatientsHtml() string
    }
```

```mermaid
classDiagram
    class CitasView {
        <<boundary>>
        +renderCitaCardHtml(cita, permisos) string
        +renderCitasListHtml(citas, permisos) string
        +renderEmptyCitasHtml() string
        +populatePacientesSelect(select, pacientes) void
        +populateMedicosSelect(select, medicos) void
        +populateMotivosDatalist(lista) void
    }
```

```mermaid
classDiagram
    class ModalReporteView {
        <<boundary>>
        +getActiveInfusionsForReport(paciente) Infusion[]
        +renderReportCardHtml(paciente, infusiones, fecha, usuario, notas, folio) string
        +generateWhatsAppReportText(paciente, infusiones, notas, usuario, fecha) string
    }
```

```mermaid
classDiagram
    class HistorialView {
        <<boundary>>
        +renderReporteCardHtml(reporte, opciones) string
        +renderHistorialListHtml(reportes, opciones) string
    }
```

```mermaid
classDiagram
    class AuthView {
        <<boundary>>
        +renderUserPillHtml(usuario) string
        +renderProfilesListHtml(usuarios, idActivo, puedeGestionar) string
        +renderPasswordPromptHtml(usuario) string
    }
```

</div>

Las vistas **no guardan estado ni acceden a los datos**: reciben objetos del controlador y regresan el HTML.
