# Diagramas del Proyecto — Aminas PWA

Diagramas de análisis y diseño del sistema **Aminas PWA** (Análisis y Diseño de Sistemas). Todos corresponden a la versión actual del código y usan la misma numeración de casos de uso, procesos y almacenes.

**Cómo verlos**
- **`.md`**: GitHub dibuja los diagramas directamente al abrir el archivo.
- **`.html`**: versión para imprimir. Ábrelo en el navegador y usa *Ctrl + P → Guardar como PDF* (necesita internet para dibujar los diagramas).
- **`imagenes/`**: cada diagrama por separado en PNG, listo para pegar en Word o en el PDF final. El prefijo indica el documento y el orden (`05-03` = documento 05, diagrama 3).

## Índice

| # | Documento | Parte de la rúbrica | Archivos |
| :---: | :--- | :--- | :--- |
| 01 | **Diagrama de contexto, Diagrama 0 y DFD** | Análisis Estructurado · Modelo ambiental y de comportamiento | [md](01_diagrama_contexto_y_dfd.md) · [html](01_diagrama_contexto_y_dfd.html) |
| 02 | **Casos de uso (alto nivel y detallados)** | Análisis y Diseño OO · Actores, CU de alto nivel y CU detallados | [md](02_casos_de_uso.md) · [html](02_casos_de_uso.html) |
| 03 | **Diagramas de clases detalladas** | Análisis OO | [md](03_diagramas_de_clases.md) · [html](03_diagramas_de_clases.html) |
| 04 | **Relaciones entre clases** | Análisis OO | [md](04_relaciones_entre_clases.md) · [html](04_relaciones_entre_clases.html) |
| 05 | **Diagramas de secuencia (6)** | Diseño OO | [md](05_diagramas_de_secuencia.md) · [html](05_diagramas_de_secuencia.html) |
| 06 | **Diagramas de colaboración (3)** | Diseño OO | [md](06_diagramas_de_colaboracion.md) · [html](06_diagramas_de_colaboracion.html) |
| 07 | **Diagrama de distribución** | Diseño OO | [md](07_diagrama_de_distribucion.md) · [html](07_diagrama_de_distribucion.html) |

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

### 02 · Casos de uso (alto nivel y detallados)

- [02-01_diagrama_de_casos_de_uso_alto_nivel_numeracion_unificada](imagenes/02-01_diagrama_de_casos_de_uso_alto_nivel_numeracion_unificada.png)

### 03 · Diagramas de clases detalladas

- [03-01_clases_de_entidad_modelo_de_dominio](imagenes/03-01_clases_de_entidad_modelo_de_dominio.png)
- [03-02_clase_AgendaService](imagenes/03-02_clase_AgendaService.png)
- [03-03_clase_AuthService](imagenes/03-03_clase_AuthService.png)
- [03-04_clase_PermisosService](imagenes/03-04_clase_PermisosService.png)
- [03-05_clase_HistorialService](imagenes/03-05_clase_HistorialService.png)
- [03-06_clase_CalculoFisiologico](imagenes/03-06_clase_CalculoFisiologico.png)
- [03-07_clase_CatalogoMedicamentos](imagenes/03-07_clase_CatalogoMedicamentos.png)
- [03-08_clase_ResultadoValidacion](imagenes/03-08_clase_ResultadoValidacion.png)
- [03-09_clase_Accion](imagenes/03-09_clase_Accion.png)
- [03-10_clase_Main](imagenes/03-10_clase_Main.png)
- [03-11_clase_AuthController](imagenes/03-11_clase_AuthController.png)
- [03-12_clase_DashboardController](imagenes/03-12_clase_DashboardController.png)
- [03-13_clase_CalculadoraController](imagenes/03-13_clase_CalculadoraController.png)
- [03-14_clase_ReporteController](imagenes/03-14_clase_ReporteController.png)
- [03-15_clase_HistorialController](imagenes/03-15_clase_HistorialController.png)
- [03-16_clase_CitasController](imagenes/03-16_clase_CitasController.png)
- [03-17_clase_StorageRepository](imagenes/03-17_clase_StorageRepository.png)
- [03-18_clase_DashboardView](imagenes/03-18_clase_DashboardView.png)
- [03-19_clase_CitasView](imagenes/03-19_clase_CitasView.png)
- [03-20_clase_ModalReporteView](imagenes/03-20_clase_ModalReporteView.png)
- [03-21_clase_HistorialView](imagenes/03-21_clase_HistorialView.png)
- [03-22_clase_AuthView](imagenes/03-22_clase_AuthView.png)

### 04 · Relaciones entre clases

- [04-01_relaciones_del_modelo_de_dominio_entidades](imagenes/04-01_relaciones_del_modelo_de_dominio_entidades.png)
- [04-02_relaciones_de_diseno_controladores_servicios_persistencia_y_vistas](imagenes/04-02_relaciones_de_diseno_controladores_servicios_persistencia_y_vistas.png)

### 05 · Diagramas de secuencia (6)

- [05-01_ds_1_cu01_iniciar_cambiar_turno](imagenes/05-01_ds_1_cu01_iniciar_cambiar_turno.png)
- [05-02_ds_2_cu08_calcular_dosis_y_velocidad](imagenes/05-02_ds_2_cu08_calcular_dosis_y_velocidad.png)
- [05-03_ds_3_cu11_generar_reporte_cu14_guardar_en_historial](imagenes/05-03_ds_3_cu11_generar_reporte_cu14_guardar_en_historial.png)
- [05-04_ds_4_cu18_agendar_cita_incluye_cu22_validar_disponibilidad](imagenes/05-04_ds_4_cu18_agendar_cita_incluye_cu22_validar_disponibilidad.png)
- [05-05_ds_5_cu19_editar_reprogramar_cita](imagenes/05-05_ds_5_cu19_editar_reprogramar_cita.png)
- [05-06_ds_6_cu26_dar_de_baja_profesional](imagenes/05-06_ds_6_cu26_dar_de_baja_profesional.png)

### 06 · Diagramas de colaboración (3)

- [06-01_dc_1_cu01_iniciar_cambiar_turno](imagenes/06-01_dc_1_cu01_iniciar_cambiar_turno.png)
- [06-02_dc_2_cu11_cu14_generar_reporte_y_guardar_en_historial](imagenes/06-02_dc_2_cu11_cu14_generar_reporte_y_guardar_en_historial.png)
- [06-03_dc_3_cu18_agendar_cita_incluye_cu22](imagenes/06-03_dc_3_cu18_agendar_cita_incluye_cu22.png)

### 07 · Diagrama de distribución

- [07-01_diagrama_de_distribucion](imagenes/07-01_diagrama_de_distribucion.png)

---

> Generado a partir de los diagramas Mermaid de cada documento. Si se modifica un `.md`, hay que volver a generar su `.html` y sus imágenes para que coincidan.
