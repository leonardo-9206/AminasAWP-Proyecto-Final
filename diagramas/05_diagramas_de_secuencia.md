# Diagramas de Secuencia — Aminas PWA

> **Diseño Orientado a Objetos.** Seis diagramas de secuencia (la rúbrica pide mínimo 5) construidos con el código real del sistema final (rama `develop`, commit `585b050`).
> Usan la **numeración de casos de uso** de [`02_casos_de_uso.md`](02_casos_de_uso.md) y las **clases y métodos** de [`03_diagramas_de_clases.md`](03_diagramas_de_clases.md).

| # | Caso de uso | Módulo |
| :---: | :--- | :--- |
| DS-1 | CU01 Iniciar / cambiar turno | Usuarios |
| DS-2 | CU08 Calcular dosis y velocidad (incluye CU09 y CU10) | Infusiones |
| DS-3 | CU11 Generar reporte + CU14 Guardar en historial | Reportes |
| DS-4 | CU18 Agendar cita (incluye CU22 Validar disponibilidad) | Citas |
| DS-5 | CU19 Editar / reprogramar cita | Citas |
| DS-6 | CU26 Dar de baja profesional | Usuarios |

**Notación:** `->>` mensaje (llamada) · `-->>` retorno · `alt/else` alternativa · `opt` opcional · `loop` repetición · las barras de activación indican que el objeto está ejecutando. `localStorage` es el almacenamiento del navegador.

---

## DS-1 · CU01 Iniciar / cambiar turno

```mermaid
sequenceDiagram
    autonumber
    actor U as Profesional
    participant AV as :AuthView
    participant AC as :AuthController
    participant AS as AuthService
    participant PS as PermisosService
    participant SR as StorageRepository
    participant LS as localStorage
    participant M as :Main

    U->>AC: clic en la píldora de usuario
    activate AC
    AC->>SR: loadUsuarios(predeterminados)
    SR->>LS: getItem("aminas_usuarios_data")
    LS-->>SR: JSON
    SR-->>AC: usuarios
    AC->>PS: puede(usuarioActivo, USUARIO_GESTIONAR)
    PS-->>AC: true / false
    AC->>AV: renderProfilesListHtml(usuarios, idActivo, puedeGestionar)
    AV-->>AC: HTML de tarjetas
    AC-->>U: modal con los perfiles
    deactivate AC

    U->>AC: handleSelectProfile(idProfesional)
    activate AC
    alt Es el perfil que ya está en turno
        AC-->>U: cierra el modal
    else Otro perfil
        AC->>AV: renderPasswordPromptHtml(profesional)
        AV-->>AC: HTML
        AC-->>U: solicita contraseña
    end
    deactivate AC

    U->>AC: handleVerifyPassword() con la contraseña
    activate AC
    AC->>AS: validarPassword(profesional, contraseña)
    AS-->>AC: valido
    alt Contraseña incorrecta
        AC-->>U: "Contraseña incorrecta"
    else Contraseña correcta
        AC->>AC: switchActiveUser(profesional)
        AC->>SR: setActiveUser(profesional)
        SR->>LS: setItem("aminas_auth_data", JSON)
        AC->>AC: renderUserPill()
        AC->>M: onUserChanged(profesional)
        activate M
        M->>M: aplica permisos en calculadora, citas e historial
        opt Está en la calculadora y el rol no puede usarla
            M->>M: showView("dashboard")
        end
        deactivate M
        AC-->>U: turno iniciado, cierra el modal
    end
    deactivate AC
```

**Lectura:** el controlador nunca lee `localStorage` directamente; pasa por `StorageRepository`. La validación de la contraseña es una regla de negocio de `AuthService`. Al cambiar de usuario, `Main` vuelve a aplicar los permisos del nuevo rol en todas las vistas.

---

## DS-2 · CU08 Calcular dosis y velocidad

```mermaid
sequenceDiagram
    autonumber
    actor U as Personal clínico
    participant CC as :CalculadoraController
    participant CM as CatalogoMedicamentos
    participant CF as CalculoFisiologico
    participant SR as StorageRepository
    participant LS as localStorage

    U->>CC: escribe un valor en una fila (evento input)
    activate CC
    CC->>CC: updateRowBaseCalculations(fila)
    CC->>CF: getDecimals(nombreFármaco)
    CF-->>CC: 1, 2 o 3 decimales
    Note right of CC: Vol. Final = Diluyente

    alt Cambió Dosis, Diluyente o Unidad (dosis → fármaco)
        CC->>CC: calculateFarmaco(fila)
        opt peso > 0, velocidad > 0 y volumen > 0
            CC->>CF: calculateFarmacoDisplay(dosis, peso, volFinal, velocidad, unidad, unidadFármaco)
            CF->>CF: calculateFarmacoMg(...)
            CF-->>CC: cantidad de fármaco
            CC-->>U: muestra Fármaco (mg o mcg)
        end
    else Cambió Velocidad o Fármaco (velocidad → dosis)
        CC->>CC: calculateDose(fila)
        alt peso <= 0
            CC-->>U: limpia el campo Fármaco
        else peso válido
            CC->>CF: calculateDosis(fármaco, unidadFármaco, peso, volFinal, velocidad, unidad)
            CF-->>CC: dosis real
            CC-->>U: muestra Dosis Real
        end
    end

    CC->>CC: updateEquivalencias(fila)
    CC->>CF: calculateEquivalenceBySpeed(..., speed = 1)
    CF-->>CC: Equivalencia 1
    CC->>CF: calculateEquivalenceBySpeed(..., speed = Velocidad 2)
    CF-->>CC: Equivalencia 2 (CU10)
    CC-->>U: muestra Equivalencia 1 y 2

    CC->>CC: saveState() lee la fila del paciente activo
    CC->>SR: saveAppState(estado)
    SR->>LS: setItem("aminas_pwa_data", JSON)
    SR-->>CC: true
    deactivate CC

    Note over U,CM: CU09: al escribir o cargar el nombre del fármaco
    U->>CC: escribe el nombre del fármaco
    activate CC
    CC->>CM: getMedInfo(nombre)
    CM-->>CC: { color, rango } o null
    CC-->>U: color pastel y "Rango: ..."
    deactivate CC
```

**Lectura:** el cálculo es **bidireccional** (fragmento `alt`). Todas las fórmulas viven en `CalculoFisiologico` (funciones puras), por lo que el núcleo matemático se puede probar sin la interfaz.

---

## DS-3 · CU11 Generar reporte + CU14 Guardar en historial

```mermaid
sequenceDiagram
    autonumber
    actor U as Personal clínico
    participant CC as :CalculadoraController
    participant M as :Main
    participant AC as :AuthController
    participant RC as :ReporteController
    participant MV as :ModalReporteView
    participant PS as PermisosService
    participant HS as HistorialService
    participant SR as StorageRepository
    participant HC as :HistorialController

    U->>CC: clic en "Generar Reporte"
    activate CC
    CC->>CC: saveState()
    CC->>CC: getActivePatientData()
    CC->>M: onGenerarReporte(paciente)
    deactivate CC
    activate M
    M->>AC: getActiveUser()
    AC-->>M: profesional en turno
    M->>RC: open(paciente, profesional)
    deactivate M
    activate RC
    RC->>MV: getActiveInfusionsForReport(paciente)
    MV-->>RC: infusiones activas
    RC->>MV: renderReportCardHtml(paciente, infusiones, fecha, profesional)
    MV-->>RC: HTML de la ficha
    RC->>PS: puede(usuario, REPORTE_GENERAR)
    PS-->>RC: true
    RC-->>U: modal con la ficha y "Guardar en Historial"
    deactivate RC

    U->>RC: escribe observaciones y pulsa "Guardar en Historial"
    activate RC
    RC->>PS: puede(usuario, REPORTE_GENERAR)
    PS-->>RC: true
    RC->>SR: loadHistorial()
    SR-->>RC: reportes
    alt Reporte nuevo (registroHistorialId = null)
        RC->>HS: crearRegistro(paciente, infusiones, notas, emisor, fecha)
        HS->>HS: generarSiguienteId(reportes)
        HS-->>RC: registro con folio
        RC->>SR: saveHistorial(reportes + registro)
        RC->>RC: registroHistorialId = folio
        RC-->>U: "Reporte guardado con folio n"
    else Ya se había guardado (evita duplicados)
        RC->>RC: actualiza notas y fechaModificacion
        RC->>SR: saveHistorial(reportes)
        RC-->>U: "Observaciones actualizadas"
    end
    RC->>HC: onHistorialChanged() → render()
    deactivate RC
```

**Lectura:** el reporte guardado es una **copia fija** (`crearRegistro` hace una copia profunda de las infusiones), por eso no cambia aunque después se ajusten las bombas.

---

## DS-4 · CU18 Agendar cita (incluye CU22 Validar disponibilidad)

```mermaid
sequenceDiagram
    autonumber
    actor U as Médico / Residente / Recepción
    participant CI as :CitasController
    participant PS as PermisosService
    participant AG as AgendaService
    participant SR as StorageRepository
    participant LS as localStorage
    participant CV as :CitasView

    U->>CI: clic en "Nueva Cita Pediátrica"
    CI-->>U: muestra el formulario (fecha y hora actuales)
    U->>CI: llena el formulario y pulsa "Agendar Cita"
    activate CI
    CI->>PS: puede(usuario, CITA_AGENDAR)
    PS-->>CI: true
    CI->>CI: leerFormulario()
    CI->>AG: validarCita(datos)
    AG-->>CI: { valido, errores }
    alt Faltan campos
        CI-->>U: aviso con los campos obligatorios
    else Datos completos
        CI->>AG: buscarEmpalme(citas, datos, null)
        Note right of AG: CU22: mismo profesional, fecha y hora con estado PROGRAMADA o EN_CURSO
        AG-->>CI: cita en conflicto o null
        alt Horario ocupado
            CI-->>U: "El horario ... ya está ocupado"
        else Horario libre
            CI->>AG: generarSiguienteId(citas)
            AG-->>CI: id
            CI->>CI: agrega la cita con estado PROGRAMADA
            CI->>SR: saveCitas(citas)
            SR->>LS: setItem("aminas_citas_data", JSON)
            CI->>CI: closeForm()
            CI->>CI: render()
            CI->>SR: loadCitas()
            SR-->>CI: citas
            CI->>AG: filtrarCitas(citas, filtro)
            AG-->>CI: citas ordenadas
            CI->>CV: renderCitasListHtml(citas, permisos)
            CV-->>CI: HTML
            CI-->>U: agenda actualizada con la nueva cita
        end
    end
    deactivate CI
```

---

## DS-5 · CU19 Editar / reprogramar cita

```mermaid
sequenceDiagram
    autonumber
    actor U as Médico / Residente / Recepción
    participant CI as :CitasController
    participant PS as PermisosService
    participant AG as AgendaService
    participant SR as StorageRepository

    U->>CI: clic en "Editar / Reprogramar" de la cita n
    activate CI
    CI->>PS: puede(usuario, CITA_AGENDAR)
    PS-->>CI: true
    CI->>CI: handleEditCita(n): busca la cita
    opt El profesional ya no está en el catálogo
        CI->>CI: agrega temporalmente la opción a la lista
    end
    CI->>CI: carga los datos en el formulario
    CI->>CI: updateFormMode() → "Editar / Reprogramar Cita n"
    CI-->>U: formulario en modo edición
    deactivate CI

    U->>CI: cambia fecha u hora y pulsa "Guardar Cambios"
    activate CI
    CI->>AG: validarCita(datos)
    AG-->>CI: válido
    CI->>AG: buscarEmpalme(citas, datos, excluirId = n)
    AG-->>CI: null (horario libre)
    alt Cambió la fecha o la hora
        CI->>CI: reprogramaciones = reprogramaciones + 1
    end
    CI->>CI: actualiza la cita y fechaModificacion
    CI->>SR: saveCitas(citas)
    CI->>CI: closeForm() regresa al modo "Nueva cita"
    CI->>CI: render()
    CI-->>U: tarjeta con los nuevos datos
    deactivate CI
```

**Diferencia con DS-4:** `buscarEmpalme` recibe el id de la propia cita (`excluirId`) para que no choque consigo misma.

---

## DS-6 · CU26 Dar de baja profesional

```mermaid
sequenceDiagram
    autonumber
    actor U as Médico Pediatra / Recepción
    participant AC as :AuthController
    participant PS as PermisosService
    participant AS as AuthService
    participant SR as StorageRepository
    participant M as :Main

    U->>AC: clic en 🗑️ del profesional p
    activate AC
    AC->>PS: puede(usuarioActivo, USUARIO_GESTIONAR)
    PS-->>AC: true
    AC->>AS: validarBajaUsuario(p, usuarios, idActivo)
    AS-->>AC: { valido, error }
    alt p es el perfil en turno
        AC-->>U: "No puedes eliminar el perfil con el turno activo"
    else p es el único Médico Pediatra
        AC-->>U: "Debe existir al menos un Médico Pediatra"
    else Baja permitida
        AC-->>U: "¿Dar de baja a ...?"
        U->>AC: confirma
        AC->>AC: quita a p de la lista
        AC->>SR: saveUsuarios(usuarios)
        AC->>M: onUserChanged(usuarioActivo)
        M->>M: vuelve a dibujar vistas (la lista de profesionales de citas ya no lo incluye)
        AC->>AC: renderProfilesList()
        AC-->>U: lista actualizada
    end
    deactivate AC
```
