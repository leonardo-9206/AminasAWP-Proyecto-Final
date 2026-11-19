# Modelo de Comportamiento — Diagramas de Flujo de Datos (DFD) · Aminas PWA

> **Análisis Estructurado Moderno (Yourdon).** Actualiza el diagrama de contexto y el DFD de la primera versión, que solo incluía la calculadora. Ahora cubre los **6 módulos** de la versión final (rama `develop`, commit `e3e1130`): Pacientes, Cálculo de Infusiones, Diccionario Médico, Reportes e Historial, Citas y Usuarios.
>
> Los nombres de flujos y almacenes de este documento son **exactamente** los que se definen en el Diccionario de Datos del proyecto.

---

## 0. Notación y convenciones

| Símbolo | Significado | Cómo se ve en los diagramas |
| :--- | :--- | :--- |
| Círculo / burbuja | **Proceso** (transforma datos). Se numera jerárquicamente: `6` → `6.1`, `6.2`… | `(( 6.2 Agendar cita ))` |
| Rectángulo | **Terminador** (entidad externa) | Caja gris |
| Cilindro amarillo | **Almacén de datos** (`D1`…`D7`). En papel se dibuja con dos líneas paralelas | Cilindro |
| Flecha continua | **Flujo de datos** (lleva datos con nombre) | `──>` |
| Flecha punteada | **Flujo de control** (activa un proceso, no lleva datos), p. ej. `OPC = 1` | `- - ->` |

### Almacenes de datos del sistema

| Almacén | Nombre | Implementación física (`localStorage`) |
| :---: | :--- | :--- |
| **D1** | Pacientes | `aminas_pwa_data` → `patients[]` (id, nombre, peso) |
| **D2** | Infusiones | `aminas_pwa_data` → `patients[].meds[]` |
| **D3** | Catálogo_fármacos | Constantes `medInfo` y `defaultMeds` (`js/core/catalogoMedicamentos.js`) |
| **D4** | Citas | `aminas_citas_data` |
| **D5** | Usuarios | `aminas_usuarios_data` |
| **D6** | Sesión_activa | `aminas_auth_data` |
| **D7** | Historial_reportes | `aminas_historial_data` |

### Terminadores

| Terminador | Descripción |
| :--- | :--- |
| **Personal clínico** | Médico Pediatra, Médico Residente y Enfermero/a. Captura pacientes e infusiones, recibe cálculos y genera reportes. |
| **Recepción** | Administrador / Recepción. Agenda citas y administra al personal. |
| **Bomba de infusión** | Dispositivo físico. Recibe **indirectamente** la velocidad (ml/h) que el usuario programa a mano. |
| **Navegador / Impresora / Portapapeles** | Entorno del dispositivo que recibe el reporte impreso (PDF) o el texto copiado para WhatsApp. |

---

## 1. Diagrama de Contexto (actualizado)

```mermaid
flowchart LR
    classDef sistema fill:#0077b6,stroke:#023e8a,stroke-width:3px,color:#fff;
    classDef term fill:#e2e8f0,stroke:#475569,stroke-width:2px,color:#1e293b;

    PC["Personal clínico<br/>(Médico / Residente / Enfermería)"]:::term
    REC["Recepción<br/>(Administrador)"]:::term
    BOMBA["Bomba de infusión"]:::term
    NAV["Navegador /<br/>Impresora / Portapapeles"]:::term

    S(("0<br/>Sistema<br/>Aminas PWA")):::sistema

    PC -- "credenciales_turno" --> S
    PC -- "datos_paciente" --> S
    PC -- "parametros_infusion" --> S
    PC -- "observaciones_reporte" --> S
    PC -- "datos_cita" --> S
    S -- "resultado_calculo" --> PC
    S -- "rango_y_color" --> PC
    S -- "ficha_reporte" --> PC
    S -- "agenda_citas" --> PC
    S -- "mensaje_error" --> PC

    REC -- "credenciales_turno" --> S
    REC -- "datos_cita" --> S
    REC -- "datos_profesional" --> S
    S -- "agenda_citas" --> REC
    S -- "lista_profesionales" --> REC

    S -. "velocidad_programada (vía usuario)" .-> BOMBA
    S -- "reporte_impreso / texto_whatsapp" --> NAV
```

> El sistema completo es la burbuja `0`. Los almacenes **no** se dibujan en el diagrama de contexto (Yourdon) porque son internos al sistema.

---

## 2. Diagrama 0 (Primer nivel)

El proceso `1. Opción Sistema` recibe la opción del menú (`OPC`) y activa, con un **flujo de control**, el módulo correspondiente. Es el mismo estilo que se vio en clase.

| OPC | Proceso activado | Pantalla real |
| :---: | :--- | :--- |
| 1 | **2. Gestión de Pacientes** | Dashboard + pestañas de la calculadora |
| 2 | **3. Cálculo de Infusiones** | Calculadora |
| 3 | **4. Diccionario Médico** | Rango y color junto a cada fármaco |
| 4 | **5. Reportes e Historial** | Modal de reporte + vista Historial |
| 5 | **6. Agenda de Citas** | Vista Citas |
| 6 | **7. Usuarios y Acceso** | Modal de perfiles |

```mermaid
flowchart TB
    classDef proc fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef store fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;
    classDef term fill:#e2e8f0,stroke:#475569,color:#1e293b;

    U["Usuario<br/>(Personal clínico / Recepción)"]:::term
    P1(("1<br/>Opción<br/>Sistema")):::proc
    RCH["rechazo"]:::term

    P2(("2<br/>Gestión de<br/>Pacientes")):::proc
    P3(("3<br/>Cálculo de<br/>Infusiones")):::proc
    P4(("4<br/>Diccionario<br/>Médico")):::proc
    P5(("5<br/>Reportes e<br/>Historial")):::proc
    P6(("6<br/>Agenda de<br/>Citas")):::proc
    P7(("7<br/>Usuarios y<br/>Acceso")):::proc

    D1[("D1 Pacientes")]:::store
    D2[("D2 Infusiones")]:::store
    D3[("D3 Catálogo_fármacos")]:::store
    D4[("D4 Citas")]:::store
    D5[("D5 Usuarios")]:::store
    D6[("D6 Sesión_activa")]:::store
    D7[("D7 Historial_reportes")]:::store

    U -- "OPC" --> P1
    P1 -- "rechazo" --> RCH
    P1 -. "OPC = 1" .-> P2
    P1 -. "OPC = 2" .-> P3
    P1 -. "OPC = 3" .-> P4
    P1 -. "OPC = 4" .-> P5
    P1 -. "OPC = 5" .-> P6
    P1 -. "OPC = 6" .-> P7

    U -- "datos_paciente" --> P2
    U -- "parametros_infusion" --> P3
    U -- "nombre_farmaco" --> P4
    U -- "observaciones_reporte" --> P5
    U -- "datos_cita" --> P6
    U -- "credenciales_turno / datos_profesional" --> P7

    P2 <--> D1
    D3 -- "infusiones_predeterminadas" --> P2
    P2 -- "infusiones_predeterminadas" --> D2
    D1 -- "peso" --> P3
    P3 <--> D2
    D3 -- "info_farmaco" --> P4
    P4 -- "rango_y_color" --> P3
    D1 -- "paciente" --> P5
    D2 -- "infusiones_activas" --> P5
    P5 <--> D7
    P6 <--> D4
    D1 -- "paciente" --> P6
    D5 -- "lista_profesionales" --> P6
    P7 <--> D5
    P7 -- "usuario_en_turno" --> D6
    D6 -- "usuario_en_turno" --> P5
```

> **Balanceo con el diagrama de contexto:** todos los flujos que entran y salen de `0` aparecen aquí como entradas y salidas de los procesos 2 a 7. Las flechas `<-->` indican lectura y escritura del mismo almacén.
>
> **Control de acceso:** los procesos 2, 5, 6 y 7 leen el `rol` de **D6 Sesión_activa** para validar permisos; el acceso al proceso 3 se valida al entrar a la calculadora. Para que el diagrama sea legible, esos flujos `rol` no se dibujan en el Diagrama 0; sí aparecen en los DFD de cada proceso. Las reglas vienen de la matriz de permisos (matriz RBAC de `js/core/permisosService.js`). Si el rol no tiene permiso, el proceso responde con `mensaje_error` y no modifica el almacén.

---

## 3. Diagramas de Flujo de Datos por proceso (explosión de cada burbuja)

Cada módulo de catálogo sigue el patrón que pide la materia: un **selector de opción** (`x.1`) activa **Alta, Baja, Cambio y Consulta**.

### 3.1 DFD 2 — Gestión de Pacientes

| Proceso | Descripción | Regla |
| :--- | :--- | :--- |
| 2.1 Opción Pacientes | Recibe la acción del usuario | — |
| 2.2 Alta de paciente | Crea un paciente con id consecutivo (`nextPatientId`) y le copia las infusiones predeterminadas del catálogo | Rol Médico o Residente |
| 2.3 Baja de paciente | Elimina el paciente y sus infusiones | Solo Médico Pediatra; debe quedar al menos 1 paciente; requiere confirmación |
| 2.4 Cambio de paciente | Actualiza nombre (título editable) y peso (kg) | Peso numérico ≥ 0 |
| 2.5 Consulta de pacientes | Muestra las tarjetas del dashboard con número de infusiones activas y abre al paciente seleccionado | — |

```mermaid
flowchart LR
    classDef proc fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef store fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;
    classDef term fill:#e2e8f0,stroke:#475569,color:#1e293b;

    U["Personal clínico"]:::term
    P21(("2.1<br/>Opción<br/>Pacientes")):::proc
    P22(("2.2<br/>Alta de<br/>paciente")):::proc
    P23(("2.3<br/>Baja de<br/>paciente")):::proc
    P24(("2.4<br/>Cambio de<br/>paciente")):::proc
    P25(("2.5<br/>Consulta de<br/>pacientes")):::proc
    D1[("D1 Pacientes")]:::store
    D2[("D2 Infusiones")]:::store
    D3[("D3 Catálogo_fármacos")]:::store
    D6[("D6 Sesión_activa")]:::store

    U -- "accion_paciente" --> P21
    P21 -. "Alta" .-> P22
    P21 -. "Baja" .-> P23
    P21 -. "Cambio" .-> P24
    P21 -. "Consulta" .-> P25

    D6 -- "rol" --> P22
    D3 -- "infusiones_predeterminadas" --> P22
    P22 -- "paciente" --> D1
    P22 -- "infusiones_predeterminadas" --> D2

    U -- "id_paciente + confirmacion" --> P23
    D6 -- "rol" --> P23
    D1 -- "total_pacientes" --> P23
    P23 -- "id_paciente" --> D1
    P23 -- "id_paciente" --> D2
    P23 -- "mensaje_error" --> U

    U -- "datos_paciente" --> P24
    P24 -- "paciente" --> D1

    D1 -- "paciente" --> P25
    D2 -- "infusiones_activas" --> P25
    P25 -- "resumen_pacientes" --> U
```

### 3.2 DFD 3 — Cálculo de Infusiones

Es el **núcleo** del sistema. El cálculo es **bidireccional**: si el usuario captura la dosis se calcula el fármaco a diluir; si captura la velocidad o el fármaco se calcula la dosis real.

| Proceso | Descripción | Fórmula / regla (`js/core/calculoFisiologico.js`) |
| :--- | :--- | :--- |
| 3.1 Opción Infusiones | Detecta qué campo cambió | — |
| 3.2 Alta de infusión | Agrega una fila de medicamento vacía (diluyente 12 ml, velocidad 1 ml/h) | — |
| 3.3 Baja de infusión | Quita la fila del medicamento | — |
| 3.4 Calcular fármaco desde dosis | `farmaco_mg = (dosis × peso × vol_final × 60) / (1000 × velocidad)` para mcg/kg/min | Peso > 0, velocidad > 0, vol_final > 0 |
| 3.5 Calcular dosis desde velocidad | `dosis = (farmaco_mg × 1000 × velocidad) / (peso × vol_final × 60)` para mcg/kg/min | Peso > 0; si no, limpia el campo |
| 3.6 Calcular equivalencias | Equivalencia 1 = dosis a **1 ml/h**; Equivalencia 2 = dosis a la **Velocidad 2** | Misma fórmula de 3.5 con otra velocidad |
| 3.7 Consulta de infusiones | Muestra la tabla (escritorio) o tarjetas (móvil) con rango y color | Usa 4. Diccionario Médico |

```mermaid
flowchart LR
    classDef proc fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef store fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;
    classDef term fill:#e2e8f0,stroke:#475569,color:#1e293b;

    U["Personal clínico"]:::term
    B["Bomba de infusión"]:::term
    P31(("3.1<br/>Opción<br/>Infusiones")):::proc
    P32(("3.2<br/>Alta de<br/>infusión")):::proc
    P33(("3.3<br/>Baja de<br/>infusión")):::proc
    P34(("3.4<br/>Calcular fármaco<br/>desde dosis")):::proc
    P35(("3.5<br/>Calcular dosis<br/>desde velocidad")):::proc
    P36(("3.6<br/>Calcular<br/>equivalencias")):::proc
    P37(("3.7<br/>Consulta de<br/>infusiones")):::proc
    P4(("4<br/>Diccionario<br/>Médico")):::proc
    D1[("D1 Pacientes")]:::store
    D2[("D2 Infusiones")]:::store

    U -- "parametros_infusion" --> P31
    P31 -. "Agregar" .-> P32
    P31 -. "Quitar" .-> P33
    P31 -. "cambia dosis / diluyente / unidad" .-> P34
    P31 -. "cambia velocidad / fármaco" .-> P35
    P31 -. "cambia velocidad 2 / unidad equiv." .-> P36
    P31 -. "Consulta" .-> P37

    P32 -- "infusion" --> D2
    U -- "indice_infusion" --> P33
    P33 -- "indice_infusion" --> D2

    D1 -- "peso" --> P34
    P34 -- "cantidad_farmaco" --> D2
    D1 -- "peso" --> P35
    P35 -- "dosis_real" --> D2
    D1 -- "peso" --> P36
    D2 -- "infusion" --> P36
    P36 -- "equivalencias" --> D2

    D2 -- "infusion" --> P37
    P4 -- "rango_y_color" --> P37
    P37 -- "resultado_calculo" --> U
    U -. "velocidad_programada" .-> B
```

### 3.3 DFD 4 — Diccionario Médico

El catálogo de fármacos es **de referencia y solo de consulta**: sus valores (rangos terapéuticos pediátricos) son datos clínicos institucionales fijos y no deben modificarse desde la aplicación. Por eso este módulo no tiene alta, baja ni cambio.

| Proceso | Descripción |
| :--- | :--- |
| 4.1 Normalizar nombre | Quita espacios y convierte a minúsculas (`Dopamina` → `dopamina`) |
| 4.2 Buscar fármaco | Busca en `medInfo`; si no existe, devuelve vacío (sin color ni rango) |
| 4.3 Determinar precisión | Norepinefrina, adrenalina y milrinona usan **3 decimales**; el resto 1 o 2 |

```mermaid
flowchart LR
    classDef proc fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef store fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;

    IN(("3.7<br/>Consulta de<br/>infusiones")):::proc
    P41(("4.1<br/>Normalizar<br/>nombre")):::proc
    P42(("4.2<br/>Buscar<br/>fármaco")):::proc
    P43(("4.3<br/>Determinar<br/>precisión")):::proc
    D3[("D3 Catálogo_fármacos")]:::store

    IN -- "nombre_farmaco" --> P41
    P41 -- "clave_farmaco" --> P42
    P41 -- "clave_farmaco" --> P43
    D3 -- "info_farmaco" --> P42
    P42 -- "rango_y_color" --> IN
    P43 -- "decimales" --> IN
```

### 3.4 DFD 5 — Reportes e Historial de Entrega de Guardia

| Proceso | Descripción | Regla |
| :--- | :--- | :--- |
| 5.1 Opción Reportes | Selecciona la acción | — |
| 5.2 Generar reporte | Toma el paciente, filtra las **infusiones activas** (dosis > 0 o velocidad > 0, con nombre) y arma la ficha con fecha, hora y firma del usuario en turno | Rol clínico |
| 5.3 Alta en historial | Guarda una **copia fija (snapshot)** del reporte con folio consecutivo | Rol clínico; si ya se guardó, actualiza en lugar de duplicar |
| 5.4 Consulta de historial | Lista los reportes del más reciente al más antiguo, con búsqueda por paciente, profesional u observaciones | — |
| 5.5 Cambio de observaciones | Reabre un reporte guardado y actualiza sus observaciones | Los datos clínicos del snapshot no cambian |
| 5.6 Baja de reporte | Elimina un reporte del historial | Solo Médico Pediatra; confirmación |
| 5.7 Exportar reporte | Imprime / guarda en PDF o copia el texto formateado para WhatsApp | — |

```mermaid
flowchart LR
    classDef proc fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef store fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;
    classDef term fill:#e2e8f0,stroke:#475569,color:#1e293b;

    U["Personal clínico"]:::term
    NAV["Navegador /<br/>Impresora / Portapapeles"]:::term
    P51(("5.1<br/>Opción<br/>Reportes")):::proc
    P52(("5.2<br/>Generar<br/>reporte")):::proc
    P53(("5.3<br/>Alta en<br/>historial")):::proc
    P54(("5.4<br/>Consulta de<br/>historial")):::proc
    P55(("5.5<br/>Cambio de<br/>observaciones")):::proc
    P56(("5.6<br/>Baja de<br/>reporte")):::proc
    P57(("5.7<br/>Exportar<br/>reporte")):::proc
    D1[("D1 Pacientes")]:::store
    D2[("D2 Infusiones")]:::store
    D6[("D6 Sesión_activa")]:::store
    D7[("D7 Historial_reportes")]:::store

    U -- "accion_reporte" --> P51
    P51 -. "Generar" .-> P52
    P51 -. "Guardar" .-> P53
    P51 -. "Historial" .-> P54
    P51 -. "Actualizar" .-> P55
    P51 -. "Eliminar" .-> P56
    P51 -. "Imprimir / WhatsApp" .-> P57

    D1 -- "paciente" --> P52
    D2 -- "infusiones_activas" --> P52
    D6 -- "usuario_en_turno" --> P52
    P52 -- "ficha_reporte" --> U

    U -- "observaciones_reporte" --> P53
    P52 -- "ficha_reporte" --> P53
    P53 -- "registro_reporte" --> D7

    U -- "texto_busqueda" --> P54
    D7 -- "registro_reporte" --> P54
    P54 -- "lista_reportes" --> U

    U -- "folio + observaciones_reporte" --> P55
    P55 -- "registro_reporte" --> D7

    U -- "folio" --> P56
    D6 -- "rol" --> P56
    P56 -- "folio" --> D7

    P52 -- "ficha_reporte" --> P57
    P57 -- "reporte_impreso / texto_whatsapp" --> NAV
```

### 3.5 DFD 6 — Agenda de Citas

| Proceso | Descripción | Regla |
| :--- | :--- | :--- |
| 6.1 Opción Citas | Selecciona la acción | — |
| 6.2 Alta de cita | Valida campos obligatorios y que no haya empalme; registra la cita con estado `PROGRAMADA` | Rol Médico, Residente o Recepción |
| 6.3 Cambio de cita (editar / reprogramar) | Modifica paciente, profesional, fecha, hora, motivo o notas; si cambia fecha u hora suma una reprogramación | Mismas reglas que 6.2, excluyendo la propia cita |
| 6.4 Cambio de estado | `PROGRAMADA → EN_CURSO → COMPLETADA`, o `→ CANCELADA` | Atender/concluir: Médico o Residente. Cancelar: Médico o Recepción |
| 6.5 Baja de cita | Elimina el registro | Médico o Recepción; confirmación |
| 6.6 Consulta de citas | Filtra por estado y texto, ordena por fecha y hora, y calcula contadores (total, hoy, programadas) | — |

```mermaid
flowchart LR
    classDef proc fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef store fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;
    classDef term fill:#e2e8f0,stroke:#475569,color:#1e293b;

    U["Personal clínico /<br/>Recepción"]:::term
    P61(("6.1<br/>Opción<br/>Citas")):::proc
    P62(("6.2<br/>Alta de<br/>cita")):::proc
    P63(("6.3<br/>Cambio de cita<br/>(reprogramar)")):::proc
    P64(("6.4<br/>Cambio de<br/>estado")):::proc
    P65(("6.5<br/>Baja de<br/>cita")):::proc
    P66(("6.6<br/>Consulta de<br/>citas")):::proc
    D1[("D1 Pacientes")]:::store
    D4[("D4 Citas")]:::store
    D5[("D5 Usuarios")]:::store
    D6[("D6 Sesión_activa")]:::store

    U -- "accion_cita" --> P61
    P61 -. "Nueva" .-> P62
    P61 -. "Editar" .-> P63
    P61 -. "Atender / Concluir / Cancelar" .-> P64
    P61 -. "Eliminar" .-> P65
    P61 -. "Filtrar / Buscar" .-> P66

    U -- "datos_cita" --> P62
    D1 -- "paciente" --> P62
    D5 -- "lista_profesionales" --> P62
    D4 -- "citas_activas" --> P62
    D6 -- "rol" --> P62
    P62 -- "cita" --> D4
    P62 -- "mensaje_error" --> U

    U -- "id_cita + datos_cita" --> P63
    D4 -- "citas_activas" --> P63
    P63 -- "cita" --> D4
    P63 -- "mensaje_error" --> U

    U -- "id_cita + nuevo_estado" --> P64
    D6 -- "rol" --> P64
    P64 -- "estado_cita" --> D4

    U -- "id_cita + confirmacion" --> P65
    D6 -- "rol" --> P65
    P65 -- "id_cita" --> D4

    U -- "filtro_citas" --> P66
    D4 -- "cita" --> P66
    P66 -- "agenda_citas" --> U
```

### 3.6 DFD 7 — Usuarios y Control de Acceso

| Proceso | Descripción | Regla |
| :--- | :--- | :--- |
| 7.1 Opción Usuarios | Selecciona la acción en el modal de perfiles | — |
| 7.2 Iniciar turno | Valida la contraseña del perfil elegido y lo guarda como usuario en turno | Contraseña correcta |
| 7.3 Alta de profesional | Registra un profesional nuevo y le inicia el turno | Rol con gestión (Médico o Recepción); cédula única; contraseña ≥ 3 caracteres y confirmada |
| 7.4 Cambio de profesional | Edita nombre, cédula, rol, especialidad, turno y contraseña (vacía = conservar) | Gestión, o el propio perfil sin cambiar rol |
| 7.5 Baja de profesional | Elimina al profesional | Gestión; no el perfil en turno; debe quedar ≥ 1 Médico Pediatra |
| 7.6 Consulta de profesionales | Muestra las tarjetas de perfiles con su rol y turno | — |

```mermaid
flowchart LR
    classDef proc fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef store fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;
    classDef term fill:#e2e8f0,stroke:#475569,color:#1e293b;

    U["Personal clínico /<br/>Recepción"]:::term
    P71(("7.1<br/>Opción<br/>Usuarios")):::proc
    P72(("7.2<br/>Iniciar<br/>turno")):::proc
    P73(("7.3<br/>Alta de<br/>profesional")):::proc
    P74(("7.4<br/>Cambio de<br/>profesional")):::proc
    P75(("7.5<br/>Baja de<br/>profesional")):::proc
    P76(("7.6<br/>Consulta de<br/>profesionales")):::proc
    D5[("D5 Usuarios")]:::store
    D6[("D6 Sesión_activa")]:::store

    U -- "accion_usuario" --> P71
    P71 -. "Seleccionar perfil" .-> P72
    P71 -. "Registrar" .-> P73
    P71 -. "Editar" .-> P74
    P71 -. "Eliminar" .-> P75
    P71 -. "Ver perfiles" .-> P76

    U -- "credenciales_turno" --> P72
    D5 -- "profesional" --> P72
    P72 -- "usuario_en_turno" --> D6
    P72 -- "mensaje_error" --> U

    U -- "datos_profesional" --> P73
    D5 -- "lista_profesionales" --> P73
    D6 -- "rol" --> P73
    P73 -- "profesional" --> D5
    P73 -- "usuario_en_turno" --> D6

    U -- "id_profesional + datos_profesional" --> P74
    D5 -- "lista_profesionales" --> P74
    D6 -- "rol" --> P74
    P74 -- "profesional" --> D5
    P74 -- "usuario_en_turno" --> D6

    U -- "id_profesional + confirmacion" --> P75
    D5 -- "lista_profesionales" --> P75
    D6 -- "usuario_en_turno" --> P75
    P75 -- "id_profesional" --> D5

    D5 -- "lista_profesionales" --> P76
    D6 -- "usuario_en_turno" --> P76
    P76 -- "lista_profesionales" --> U
```

---

## 4. Especificación de procesos primitivos (mini-especificaciones)

Pseudocódigo estructurado de los procesos con lógica de negocio más importante.

**3.4 Calcular fármaco desde dosis**
```text
SI peso <= 0 O velocidad <= 0 O vol_final <= 0 O dosis <= 0 ENTONCES
    no calcular (dejar campo como está)
SI NO
    SEGÚN unidad_dosis
        "mcg/kg/min": farmaco_mg = (dosis * peso * vol_final * 60) / (1000 * velocidad)
        "mcg/kg/h"  : farmaco_mg = (dosis * peso * vol_final) / (1000 * velocidad)
        "mg/kg/h"   : farmaco_mg = (dosis * peso * vol_final) / velocidad
    SI unidad_farmaco = "mcg" ENTONCES cantidad_farmaco = farmaco_mg * 1000
    SI NO cantidad_farmaco = farmaco_mg
    redondear cantidad_farmaco a "decimales" (proceso 4.3)
```

**3.5 Calcular dosis desde velocidad**
```text
SI peso <= 0 ENTONCES limpiar cantidad_farmaco y terminar
farmaco_mg = cantidad_farmaco / 1000 SI unidad_farmaco = "mcg", SI NO cantidad_farmaco
SEGÚN unidad_dosis
    "mcg/kg/min": dosis = (farmaco_mg * 1000 * velocidad) / (peso * vol_final * 60)
    "mcg/kg/h"  : dosis = (farmaco_mg * 1000 * velocidad) / (peso * vol_final)
    "mg/kg/h"   : dosis = (farmaco_mg * velocidad) / (peso * vol_final)
redondear dosis a "decimales" (proceso 4.3)
```

**6.2 Alta de cita**
```text
SI rol NO está en {MEDICO_PEDIATRA, RESIDENTE, RECEPCION} ENTONCES mensaje_error "Acción no permitida"
SI falta paciente, profesional, fecha, hora o motivo ENTONCES mensaje_error con los campos faltantes
BUSCAR en D4 una cita con mismo profesional, fecha y hora con estado PROGRAMADA o EN_CURSO
SI existe ENTONCES mensaje_error "Horario ocupado"
SI NO
    id = mayor id de D4 + 1
    guardar cita con estado = PROGRAMADA y fecha_registro = ahora
```

**7.5 Baja de profesional**
```text
SI rol NO tiene permiso de gestión ENTONCES mensaje_error
SI id_profesional = id del usuario en turno ENTONCES mensaje_error "No puedes eliminar el perfil activo"
SI el profesional es MEDICO_PEDIATRA Y es el único ENTONCES mensaje_error
SI el usuario confirma ENTONCES eliminar de D5
```
