# Diagramas del Proyecto — Aminas PWA

Diagramas de análisis y diseño del sistema **Aminas PWA** (Análisis y Diseño de Sistemas), ordenados como en la rúbrica: primero el análisis y diseño estructurado y después el orientado a objetos. Todos corresponden a la versión actual del código y usan la misma numeración de casos de uso, procesos, almacenes y tablas.

**Cómo verlos**
- **`.md`**: GitHub dibuja los diagramas directamente al abrir el archivo.
- **`.html`**: versión para imprimir. Ábrelo en el navegador y usa *Ctrl + P → Guardar como PDF* (necesita internet para dibujar los diagramas).
- **`imagenes/`**: cada diagrama por separado en PNG, listo para pegar en Word o en el PDF final. El prefijo indica el documento y el orden (`07-03` = documento 07, diagrama 3).

## Índice

| # | Documento | Parte de la rúbrica | Archivos |
| :---: | :--- | :--- | :--- |
| 01 | **Diagrama de contexto, Diagrama 0 y DFD** | Análisis Estructurado · Modelo ambiental y de comportamiento | [md](01_diagrama_contexto_y_dfd.md) · [html](01_diagrama_contexto_y_dfd.html) |
| 02 | **Entidad-relación y estructura de tablas** | Diseño Estructurado · Estructura de tablas | [md](02_entidad_relacion_y_tablas.md) · [html](02_entidad_relacion_y_tablas.html) |
| 03 | **Navegación de pantallas** | Diseño Estructurado · Diseño de pantallas | [md](03_navegacion_de_pantallas.md) · [html](03_navegacion_de_pantallas.html) |
| 04 | **Casos de uso (alto nivel y detallados)** | Análisis y Diseño OO · Actores, CU de alto nivel y CU detallados | [md](04_casos_de_uso.md) · [html](04_casos_de_uso.html) |
| 05 | **Diagramas de clases detalladas** | Análisis OO | [md](05_diagramas_de_clases.md) · [html](05_diagramas_de_clases.html) |
| 06 | **Relaciones entre clases** | Análisis OO | [md](06_relaciones_entre_clases.md) · [html](06_relaciones_entre_clases.html) |
| 07 | **Diagramas de secuencia (6)** | Diseño OO | [md](07_diagramas_de_secuencia.md) · [html](07_diagramas_de_secuencia.html) |
| 08 | **Diagramas de colaboración (3)** | Diseño OO | [md](08_diagramas_de_colaboracion.md) · [html](08_diagramas_de_colaboracion.html) |
| 09 | **Diagrama de distribución** | Diseño OO | [md](09_diagrama_de_distribucion.md) · [html](09_diagrama_de_distribucion.html) |
| 10 | **Arquitectura en capas** | Complemento de diseño | [md](10_arquitectura_en_capas.md) · [html](10_arquitectura_en_capas.html) |

## Imágenes por documento

### 01 · Diagrama de contexto, Diagrama 0 y DFD

- [01-01_diagrama_de_contexto_actualizado](imagenes/01-01_diagrama_de_contexto_actualizado.png)
- [01-02_diagrama_0_primer_nivel](imagenes/01-02_diagrama_0_primer_nivel.png)
- [01-03_dfd_2_gestion_de_pacientes](imagenes/01-03_dfd_2_gestion_de_pacientes.png)
- [01-04_dfd_3_calculo_de_infusiones](imagenes/01-04_dfd_3_calculo_de_infusiones.png)
- [01-05_dfd_4_diccionario_medico](imagenes/01-05_dfd_4_diccionario_medico.png)
- [01-06_dfd_5_reportes_e_historial_de_entrega_de_guardia](imagenes/01-06_dfd_5_reportes_e_historial_de_entrega_de_guardia.png)
- [01-07_dfd_6_agenda_de_citas](imagenes/01-07_dfd_6_agenda_de_citas.png)
- [01-08_dfd_7_usuarios_y_control_de_acceso](imagenes/01-08_dfd_7_usuarios_y_control_de_acceso.png)

### 02 · Entidad-relación y estructura de tablas

- [02-01_diagrama_entidad_relacion](imagenes/02-01_diagrama_entidad_relacion.png)

### 03 · Navegación de pantallas

- [03-01_diagrama_de_navegacion](imagenes/03-01_diagrama_de_navegacion.png)

### 04 · Casos de uso (alto nivel y detallados)

- [04-01_diagrama_de_casos_de_uso_alto_nivel_numeracion_unificada](imagenes/04-01_diagrama_de_casos_de_uso_alto_nivel_numeracion_unificada.png)

### 05 · Diagramas de clases detalladas

- [05-01_clases_de_entidad_modelo_de_dominio](imagenes/05-01_clases_de_entidad_modelo_de_dominio.png)
- [05-02_clase_AgendaService](imagenes/05-02_clase_AgendaService.png)
- [05-03_clase_AuthService](imagenes/05-03_clase_AuthService.png)
- [05-04_clase_PermisosService](imagenes/05-04_clase_PermisosService.png)
- [05-05_clase_HistorialService](imagenes/05-05_clase_HistorialService.png)
- [05-06_clase_CalculoFisiologico](imagenes/05-06_clase_CalculoFisiologico.png)
- [05-07_clase_CatalogoMedicamentos](imagenes/05-07_clase_CatalogoMedicamentos.png)
- [05-08_clase_ResultadoValidacion](imagenes/05-08_clase_ResultadoValidacion.png)
- [05-09_clase_Accion](imagenes/05-09_clase_Accion.png)
- [05-10_clase_Main](imagenes/05-10_clase_Main.png)
- [05-11_clase_AuthController](imagenes/05-11_clase_AuthController.png)
- [05-12_clase_DashboardController](imagenes/05-12_clase_DashboardController.png)
- [05-13_clase_CalculadoraController](imagenes/05-13_clase_CalculadoraController.png)
- [05-14_clase_ReporteController](imagenes/05-14_clase_ReporteController.png)
- [05-15_clase_HistorialController](imagenes/05-15_clase_HistorialController.png)
- [05-16_clase_CitasController](imagenes/05-16_clase_CitasController.png)
- [05-17_clase_StorageRepository](imagenes/05-17_clase_StorageRepository.png)
- [05-18_clase_DashboardView](imagenes/05-18_clase_DashboardView.png)
- [05-19_clase_CitasView](imagenes/05-19_clase_CitasView.png)
- [05-20_clase_ModalReporteView](imagenes/05-20_clase_ModalReporteView.png)
- [05-21_clase_HistorialView](imagenes/05-21_clase_HistorialView.png)
- [05-22_clase_AuthView](imagenes/05-22_clase_AuthView.png)

### 06 · Relaciones entre clases

- [06-01_relaciones_del_modelo_de_dominio_entidades](imagenes/06-01_relaciones_del_modelo_de_dominio_entidades.png)
- [06-02_relaciones_de_diseno_controladores_servicios_persistencia_y_vistas](imagenes/06-02_relaciones_de_diseno_controladores_servicios_persistencia_y_vistas.png)

### 07 · Diagramas de secuencia (6)

- [07-01_ds_1_cu01_iniciar_cambiar_turno](imagenes/07-01_ds_1_cu01_iniciar_cambiar_turno.png)
- [07-02_ds_2_cu08_calcular_dosis_y_velocidad](imagenes/07-02_ds_2_cu08_calcular_dosis_y_velocidad.png)
- [07-03_ds_3_cu11_generar_reporte_cu14_guardar_en_historial](imagenes/07-03_ds_3_cu11_generar_reporte_cu14_guardar_en_historial.png)
- [07-04_ds_4_cu18_agendar_cita_incluye_cu22_validar_disponibilidad](imagenes/07-04_ds_4_cu18_agendar_cita_incluye_cu22_validar_disponibilidad.png)
- [07-05_ds_5_cu19_editar_reprogramar_cita](imagenes/07-05_ds_5_cu19_editar_reprogramar_cita.png)
- [07-06_ds_6_cu26_dar_de_baja_profesional](imagenes/07-06_ds_6_cu26_dar_de_baja_profesional.png)

### 08 · Diagramas de colaboración (3)

- [08-01_dc_1_cu01_iniciar_cambiar_turno](imagenes/08-01_dc_1_cu01_iniciar_cambiar_turno.png)
- [08-02_dc_2_cu11_cu14_generar_reporte_y_guardar_en_historial](imagenes/08-02_dc_2_cu11_cu14_generar_reporte_y_guardar_en_historial.png)
- [08-03_dc_3_cu18_agendar_cita_incluye_cu22](imagenes/08-03_dc_3_cu18_agendar_cita_incluye_cu22.png)

### 09 · Diagrama de distribución

- [09-01_diagrama_de_distribucion](imagenes/09-01_diagrama_de_distribucion.png)

### 10 · Arquitectura en capas

- [10-01_vista_general_de_las_capas](imagenes/10-01_vista_general_de_las_capas.png)
- [10-02_modulos_y_dependencias_reales](imagenes/10-02_modulos_y_dependencias_reales.png)

---

> Generado a partir de los diagramas Mermaid de cada documento. Si se modifica un `.md`, hay que volver a generar su `.html` y sus imágenes para que coincidan.
