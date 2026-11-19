# Diagrama de Navegación de Pantallas — Aminas PWA

> **Diseño Estructurado Moderno · Diseño de pantallas.** Muestra cómo se pasa de una pantalla a otra en la aplicación final (rama `develop`): **4 vistas** principales y **2 ventanas modales**, con el botón que provoca cada cambio y las restricciones por rol.
> Actualiza el diagrama de vistas de la primera versión, que solo tenía Dashboard, Calculadora y Reporte.

---

## 1. Pantallas del sistema

| Código | Pantalla | Tipo | Casos de uso | Quién puede entrar |
| :---: | :--- | :--- | :--- | :--- |
| **V1** | Dashboard / Inicio | Vista | CU02, CU03 | Todos |
| **V2** | Calculadora de Infusiones | Vista | CU03–CU10 | Médico, Residente, Enfermería (**no** Recepción) |
| **V3** | Agenda de Citas (con formulario de alta/edición) | Vista | CU18–CU23 | Todos (los botones cambian según el rol) |
| **V4** | Historial de Entregas de Guardia | Vista | CU15–CU17 | Todos |
| **M1** | Reporte de Guardia / Ficha Médica | Modal | CU11–CU14, CU16 | Médico, Residente, Enfermería |
| **M2** | Control de Acceso (Perfiles · Contraseña · Registro/Edición) | Modal | CU01, CU24–CU26 | Todos (registrar/editar a otros: Médico y Recepción) |

La **barra superior** (marca y píldora del usuario en turno) está visible en todas las vistas; desde ella siempre se abre **M2**.

---

## 2. Diagrama de navegación

```mermaid
flowchart TB
    classDef vista fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef modal fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95;
    classDef inicio fill:#dcfce7,stroke:#15803d,color:#14532d;
    classDef sub fill:#f8fafc,stroke:#94a3b8,color:#334155;

    START(["Abrir la app"]):::inicio
    CARGA["Cargar datos del dispositivo<br/>y usuario en turno"]:::sub

    V1["V1 · Dashboard / Inicio"]:::vista
    V2["V2 · Calculadora de Infusiones"]:::vista
    V3["V3 · Agenda de Citas"]:::vista
    V4["V4 · Historial de Entregas"]:::vista

    M1["M1 · Reporte de Guardia (modal)"]:::modal
    M2["M2 · Control de Acceso (modal)"]:::modal

    F3["Formulario de cita<br/>(alta / edición)"]:::sub
    P1["Perfiles"]:::sub
    P2["Contraseña"]:::sub
    P3["Registro / edición<br/>de profesional"]:::sub

    START --> CARGA --> V1

    V1 -- "Tarjeta de paciente / Continuar<br/>[rol clínico]" --> V2
    V1 -- "Nuevo Paciente<br/>[Médico o Residente]" --> V2
    V1 -- "Agenda de Citas" --> V3
    V1 -- "Historial de Reportes" --> V4

    V2 -- "Volver al Inicio" --> V1
    V2 -- "Agenda de Citas" --> V3
    V2 -- "Pestaña / + Nuevo" --> V2
    V2 -- "Generar Reporte" --> M1

    V3 -- "Volver al Inicio" --> V1
    V3 -- "Calculadora de Bombas / Ver Bombas<br/>[rol clínico]" --> V2
    V3 -- "Nueva Cita / Editar" --> F3
    F3 -- "Agendar / Guardar Cambios /<br/>Cancelar Edición" --> V3

    V4 -- "Volver al Inicio" --> V1
    V4 -- "Ver / Editar Observaciones" --> M1

    M1 -- "Cerrar / ✕ / Esc" --> V2
    M1 -- "Cerrar (si se abrió desde Historial)" --> V4

    V1 & V2 & V3 & V4 -. "Píldora de usuario" .-> M2
    M2 --- P1
    P1 -- "Ingresar Contraseña" --> P2
    P2 -- "Volver a la Lista" --> P1
    P1 -- "Registrar / Editar<br/>[Médico o Recepción, o propio perfil]" --> P3
    P3 -- "Guardar edición / Cancelar" --> P1
    FIN["Cierra M2 y regresa a la vista actual<br/>(Recepción en V2 → V1)"]:::sub
    P2 -- "Contraseña correcta: cambia el turno" --> FIN
    P3 -- "Registrar: inicia turno del nuevo profesional" --> FIN
```

**Lectura del diagrama**
- Las cajas azules son **vistas** (ocupan toda la pantalla); las moradas son **modales** (aparecen encima de la vista actual).
- `[condición]` indica que la transición solo existe para ciertos roles. Si el rol no tiene permiso, el botón no aparece; y si se intenta por otra vía, se muestra *"🔒 Acción no permitida"* y se queda en la pantalla actual.
- Al cambiar de turno (M2), todas las vistas se vuelven a dibujar con los permisos del nuevo rol. Si el nuevo rol es **Recepción** y estaba en la Calculadora, regresa a **V1**.
- Los modales M1 y M2 se cierran con **Cerrar**, la **✕**, clic fuera de la ventana o la tecla **Esc**, y regresan a la vista de donde se abrieron.

---

## 3. Acciones de salida desde M1 (Reporte)

| Botón | Resultado | No cambia de pantalla |
| :--- | :--- | :---: |
| 💾 Guardar en Historial / Actualizar Observaciones | Guarda el snapshot o las observaciones y muestra un aviso | ✅ |
| 📋 Copiar para WhatsApp | Copia el resumen al portapapeles | ✅ |
| 🖨️ Imprimir / Guardar PDF | Abre el diálogo de impresión del navegador | ✅ |

---

## 4. Comportamiento responsivo

| Pantalla | Escritorio (> 768 px) | Celular (≤ 768 px) |
| :--- | :--- | :--- |
| V2 Calculadora | Tabla de 11 columnas (con desplazamiento horizontal si no cabe) | Cada infusión se convierte en una **tarjeta** con una etiqueta por campo |
| Barra superior y navegación | Marca y usuario en una línea; botones de navegación en fila | Los elementos se acomodan en varias líneas |
| V1, V3, V4 | Tarjetas en cuadrícula | Las tarjetas se reacomodan al ancho de la pantalla |
| Impresión de M1 | Se oculta la interfaz y queda solo la ficha en hoja blanca | Igual |
