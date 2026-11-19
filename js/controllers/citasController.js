// js/controllers/citasController.js
/**
 * Controlador del Módulo de Citas y Agenda (Capa de Aplicación).
 * Gestiona el ABCC de citas: agendamiento (Alta), eliminación (Baja),
 * edición / reprogramación y transiciones de estado (Cambios), filtros (Consultas)
 * y persistencia en LocalStorage.
 */

import { defaultMeds } from '../core/catalogoMedicamentos.js';
import { AgendaService, ESTADOS_CITA } from '../core/agendaService.js';
import { AuthService } from '../core/authService.js';
import { PermisosService, ACCIONES } from '../core/permisosService.js';
import { StorageRepository } from '../data/storageRepository.js';
import {
    renderCitasListHtml,
    populatePacientesSelect,
    populateMedicosSelect,
    populateMotivosDatalist
} from '../ui/citasView.js';

const TEXTO_BTN_NUEVA = '<span>➕</span> Nueva Cita Pediátrica';
const TEXTO_BTN_OCULTAR = '<span>▲</span> Ocultar Formulario';

export class CitasController {
    /**
     * @param {Object} options
     * @param {Function} options.onNavigateToDashboard
     * @param {Function} options.onNavigateToCalculadora - Callback (recibe patientId)
     */
    constructor({ onNavigateToDashboard, onNavigateToCalculadora } = {}) {
        this.onNavigateToDashboard = onNavigateToDashboard || null;
        this.onNavigateToCalculadora = onNavigateToCalculadora || null;

        // Elementos de Interfaz
        this.container = document.getElementById('view-citas');
        this.citasListContainer = document.getElementById('citas-container');

        // Formulario
        this.form = document.getElementById('form-nueva-cita');
        this.formWrapper = document.getElementById('form-cita-wrapper');
        this.formTitle = document.getElementById('cita-form-title');
        this.btnToggleForm = document.getElementById('btn-toggle-form-cita');
        this.btnGuardar = document.getElementById('btn-guardar-cita');
        this.btnCancelarEdicion = document.getElementById('btn-cancelar-edicion-cita');
        this.pacienteSelect = document.getElementById('cita-paciente-select');
        this.customNombreGroup = document.getElementById('cita-custom-nombre-group');
        this.customNombreInput = document.getElementById('cita-custom-nombre');
        this.medicoSelect = document.getElementById('cita-medico-select');
        this.fechaInput = document.getElementById('cita-fecha');
        this.horaInput = document.getElementById('cita-hora');
        this.motivoInput = document.getElementById('cita-motivo');
        this.motivosDatalist = document.getElementById('motivos-sugeridos-list');
        this.notasInput = document.getElementById('cita-notas');
        this.formAlert = document.getElementById('cita-form-alert');

        // Filtros y Búsqueda
        this.filterEstadoSelect = document.getElementById('citas-filter-estado');
        this.searchInput = document.getElementById('citas-search-input');

        // Contadores
        this.countTotalEl = document.getElementById('citas-count-total');
        this.countHoyEl = document.getElementById('citas-count-hoy');
        this.countProgEl = document.getElementById('citas-count-prog');

        // Navegación
        this.btnBackDashboard = document.getElementById('btn-citas-back-dashboard');
        this.btnGoCalc = document.getElementById('btn-citas-go-calc');

        this.citas = [];
        this.filtroEstadoActual = 'TODOS';
        this.busquedaActual = '';
        this.editingCitaId = null; // null = modo alta; número = modo edición
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDateTime();
        this.render();
    }

    /** Usuario con turno activo (para aplicar permisos). */
    getActiveUser() {
        return StorageRepository.getActiveUser();
    }

    puede(accion) {
        return PermisosService.puede(this.getActiveUser(), accion);
    }

    setDefaultDateTime() {
        const now = new Date();
        const hoy = now.toISOString().split('T')[0];
        const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (this.fechaInput && !this.fechaInput.value) {
            this.fechaInput.value = hoy;
        }
        if (this.horaInput && !this.horaInput.value) {
            this.horaInput.value = hora;
        }
    }

    setupEventListeners() {
        // Alternar visualización del formulario
        if (this.btnToggleForm && this.formWrapper) {
            this.btnToggleForm.addEventListener('click', () => {
                const isHidden = this.formWrapper.style.display === 'none';
                if (isHidden) {
                    this.openForm();
                } else {
                    this.closeForm();
                }
            });
        }

        if (this.btnCancelarEdicion) {
            this.btnCancelarEdicion.addEventListener('click', () => this.closeForm());
        }

        // Cambio en selector de paciente (si selecciona OTRO, muestra input de texto libre)
        if (this.pacienteSelect) {
            this.pacienteSelect.addEventListener('change', () => {
                this.toggleCustomNombre(this.pacienteSelect.value === 'OTRO', true);
            });
        }

        // Envío del formulario (alta o cambio según el modo)
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveCita();
            });
        }

        // Filtro por estado
        if (this.filterEstadoSelect) {
            this.filterEstadoSelect.addEventListener('change', () => {
                this.filtroEstadoActual = this.filterEstadoSelect.value;
                this.renderList();
            });
        }

        // Búsqueda en tiempo real
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.busquedaActual = this.searchInput.value;
                this.renderList();
            });
        }

        // Acciones en tarjetas de citas (delegación de eventos)
        if (this.citasListContainer) {
            this.citasListContainer.addEventListener('click', (e) => {
                // Ir a calculadora del paciente
                const btnCalc = e.target.closest('.btn-cita-goto-calc');
                if (btnCalc) {
                    const pacienteId = parseInt(btnCalc.dataset.pacienteId, 10);
                    if (!isNaN(pacienteId) && typeof this.onNavigateToCalculadora === 'function') {
                        this.onNavigateToCalculadora(pacienteId);
                    }
                    return;
                }

                // Editar / reprogramar cita
                const btnEdit = e.target.closest('.btn-cita-edit');
                if (btnEdit) {
                    const citaId = parseInt(btnEdit.dataset.citaId, 10);
                    if (!isNaN(citaId)) {
                        this.handleEditCita(citaId);
                    }
                    return;
                }

                // Cambiar estado de cita
                const btnState = e.target.closest('.btn-cita-change-state');
                if (btnState) {
                    const citaId = parseInt(btnState.dataset.citaId, 10);
                    const newState = btnState.dataset.newState;
                    if (!isNaN(citaId) && newState) {
                        this.handleChangeState(citaId, newState);
                    }
                    return;
                }

                // Eliminar cita
                const btnDelete = e.target.closest('.btn-cita-delete');
                if (btnDelete) {
                    const citaId = parseInt(btnDelete.dataset.citaId, 10);
                    if (!isNaN(citaId)) {
                        this.handleDeleteCita(citaId);
                    }
                }
            });
        }

        // Botones de navegación
        if (this.btnBackDashboard) {
            this.btnBackDashboard.addEventListener('click', () => {
                if (typeof this.onNavigateToDashboard === 'function') {
                    this.onNavigateToDashboard();
                }
            });
        }

        if (this.btnGoCalc) {
            this.btnGoCalc.addEventListener('click', () => {
                if (typeof this.onNavigateToCalculadora === 'function') {
                    this.onNavigateToCalculadora();
                }
            });
        }
    }

    // ------------------------------------------------------------------
    // Manejo del formulario (modo alta / modo edición)
    // ------------------------------------------------------------------

    toggleCustomNombre(visible, focus = false) {
        if (this.customNombreGroup) this.customNombreGroup.style.display = visible ? 'block' : 'none';
        if (visible && focus && this.customNombreInput) this.customNombreInput.focus();
    }

    openForm() {
        if (!this.formWrapper) return;
        this.formWrapper.style.display = 'block';
        if (this.btnToggleForm) this.btnToggleForm.innerHTML = TEXTO_BTN_OCULTAR;
    }

    /** Cierra el formulario y lo regresa al modo "Alta". */
    closeForm() {
        this.editingCitaId = null;
        if (this.form) this.form.reset();
        this.toggleCustomNombre(false);
        this.hideFormAlert();
        this.setDefaultDateTime();
        this.updateFormMode();

        if (this.formWrapper) this.formWrapper.style.display = 'none';
        if (this.btnToggleForm) this.btnToggleForm.innerHTML = TEXTO_BTN_NUEVA;
    }

    /** Ajusta títulos y botones según si se está agendando o editando. */
    updateFormMode() {
        const editando = this.editingCitaId !== null;
        if (this.formTitle) {
            this.formTitle.innerText = editando
                ? `✏️ Editar / Reprogramar Cita #${this.editingCitaId}`
                : 'Programar Nueva Cita o Control Clínico';
        }
        if (this.btnGuardar) {
            this.btnGuardar.innerHTML = editando ? '💾 Guardar Cambios' : '💾 Agendar Cita';
        }
        if (this.btnCancelarEdicion) {
            this.btnCancelarEdicion.style.display = editando ? 'inline-flex' : 'none';
        }
    }

    /** Lee los datos capturados en el formulario. */
    leerFormulario() {
        let pacienteId = null;
        let pacienteNombre = '';

        if (this.pacienteSelect.value === 'OTRO') {
            pacienteNombre = this.customNombreInput ? this.customNombreInput.value.trim() : '';
        } else if (this.pacienteSelect.value) {
            pacienteId = parseInt(this.pacienteSelect.value, 10);
            const selectedOpt = this.pacienteSelect.options[this.pacienteSelect.selectedIndex];
            pacienteNombre = selectedOpt ? selectedOpt.dataset.name : `Paciente ${pacienteId}`;
        }

        return {
            pacienteId,
            pacienteNombre,
            medicoResponsable: this.medicoSelect.value.trim(),
            fecha: this.fechaInput.value.trim(),
            hora: this.horaInput.value.trim(),
            motivo: this.motivoInput.value.trim(),
            notas: this.notasInput ? this.notasInput.value.trim() : ''
        };
    }

    // ------------------------------------------------------------------
    // Operaciones del catálogo de Citas (ABCC)
    // ------------------------------------------------------------------

    /** Alta o Cambio de cita según el modo del formulario. */
    handleSaveCita() {
        if (!this.puede(ACCIONES.CITA_AGENDAR)) {
            this.showFormAlert(PermisosService.mensajeDenegado(this.getActiveUser()));
            return;
        }

        const citaData = this.leerFormulario();

        const validacion = AgendaService.validarCita(citaData);
        if (!validacion.valido) {
            this.showFormAlert(validacion.errores.join(' '));
            return;
        }

        const empalme = AgendaService.buscarEmpalme(this.citas, citaData, this.editingCitaId);
        if (empalme) {
            this.showFormAlert(
                `El horario ${citaData.fecha} a las ${citaData.hora} hrs ya está ocupado para ${citaData.medicoResponsable} ` +
                `(cita de ${empalme.pacienteNombre}). Elige otra hora o profesional.`
            );
            return;
        }

        this.hideFormAlert();

        if (this.editingCitaId !== null) {
            // CAMBIO: editar / reprogramar
            const index = this.citas.findIndex(c => c.id === this.editingCitaId);
            if (index === -1) {
                this.showFormAlert('La cita que intentas editar ya no existe.');
                return;
            }
            const anterior = this.citas[index];
            const reprogramada = anterior.fecha !== citaData.fecha || anterior.hora !== citaData.hora;
            this.citas[index] = {
                ...anterior,
                ...citaData,
                reprogramaciones: (anterior.reprogramaciones || 0) + (reprogramada ? 1 : 0),
                fechaModificacion: new Date().toISOString()
            };
        } else {
            // ALTA: nueva cita
            const nuevoId = AgendaService.generarSiguienteId(this.citas);
            this.citas.unshift({
                id: nuevoId,
                ...citaData,
                estado: ESTADOS_CITA.PROGRAMADA,
                fechaRegistro: new Date().toISOString()
            });
        }

        StorageRepository.saveCitas(this.citas);
        this.closeForm();
        this.render();
    }

    /** Carga una cita en el formulario para editarla / reprogramarla. */
    handleEditCita(citaId) {
        if (!this.puede(ACCIONES.CITA_AGENDAR)) {
            alert(PermisosService.mensajeDenegado(this.getActiveUser()));
            return;
        }

        const cita = this.citas.find(c => c.id === citaId);
        if (!cita) return;

        this.editingCitaId = citaId;
        this.hideFormAlert();

        // Paciente: registrado o externo
        const optionPaciente = cita.pacienteId !== null && cita.pacienteId !== undefined
            ? this.pacienteSelect.querySelector(`option[value="${cita.pacienteId}"]`)
            : null;
        if (optionPaciente) {
            this.pacienteSelect.value = String(cita.pacienteId);
            this.toggleCustomNombre(false);
        } else {
            this.pacienteSelect.value = 'OTRO';
            if (this.customNombreInput) this.customNombreInput.value = cita.pacienteNombre || '';
            this.toggleCustomNombre(true);
        }

        // Profesional: si ya no está en el catálogo, se agrega temporalmente para no perder el dato
        if (!Array.from(this.medicoSelect.options).some(o => o.value === cita.medicoResponsable)) {
            const opt = document.createElement('option');
            opt.value = cita.medicoResponsable;
            opt.textContent = cita.medicoResponsable;
            this.medicoSelect.appendChild(opt);
        }
        this.medicoSelect.value = cita.medicoResponsable;

        this.fechaInput.value = cita.fecha;
        this.horaInput.value = cita.hora;
        this.motivoInput.value = cita.motivo;
        if (this.notasInput) this.notasInput.value = cita.notas || '';

        this.updateFormMode();
        this.openForm();
        this.formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    handleChangeState(citaId, newState) {
        const accion = newState === ESTADOS_CITA.CANCELADA ? ACCIONES.CITA_CANCELAR : ACCIONES.CITA_ATENDER;
        if (!this.puede(accion)) {
            alert(PermisosService.mensajeDenegado(this.getActiveUser()));
            return;
        }

        const cita = this.citas.find(c => c.id === citaId);
        if (!cita) return;

        if (newState === ESTADOS_CITA.CANCELADA && !confirm(`¿Cancelar la cita de ${cita.pacienteNombre}?`)) {
            return;
        }

        cita.estado = newState;
        cita.fechaModificacion = new Date().toISOString();
        StorageRepository.saveCitas(this.citas);

        if (this.editingCitaId === citaId) this.closeForm();
        this.render();
    }

    handleDeleteCita(citaId) {
        if (!this.puede(ACCIONES.CITA_CANCELAR)) {
            alert(PermisosService.mensajeDenegado(this.getActiveUser()));
            return;
        }

        const cita = this.citas.find(c => c.id === citaId);
        const nombre = cita ? cita.pacienteNombre : 'esta cita';

        if (confirm(`¿Estás seguro de eliminar el registro de cita para ${nombre}?`)) {
            this.citas = this.citas.filter(c => c.id !== citaId);
            StorageRepository.saveCitas(this.citas);
            if (this.editingCitaId === citaId) this.closeForm();
            this.render();
        }
    }

    showFormAlert(message) {
        if (!this.formAlert) return;
        this.formAlert.innerText = `⚠️ ${message}`;
        this.formAlert.style.display = 'block';
    }

    hideFormAlert() {
        if (!this.formAlert) return;
        this.formAlert.innerText = '';
        this.formAlert.style.display = 'none';
    }

    render() {
        // Cargar citas persistidas
        this.citas = StorageRepository.loadCitas();

        // Si se está editando, no se reconstruye el formulario para no perder lo capturado
        if (this.editingCitaId === null) {
            const appState = StorageRepository.loadAppState(defaultMeds);
            const patients = appState.patients || [];
            const usuarios = StorageRepository.loadUsuarios(AuthService.getUsuariosPredefinidos());

            populatePacientesSelect(this.pacienteSelect, patients);
            populateMedicosSelect(this.medicoSelect, AgendaService.obtenerMedicosDisponibles(usuarios));
            populateMotivosDatalist(this.motivosDatalist);
        }

        // Permisos: ocultar el botón de alta si el rol no puede agendar
        const puedeAgendar = this.puede(ACCIONES.CITA_AGENDAR);
        if (this.btnToggleForm) {
            this.btnToggleForm.style.display = puedeAgendar ? '' : 'none';
        }
        if (!puedeAgendar && this.formWrapper && this.formWrapper.style.display !== 'none') {
            this.closeForm();
        }

        // Actualizar contadores
        if (this.countTotalEl) {
            this.countTotalEl.innerText = this.citas.length;
        }
        if (this.countHoyEl) {
            this.countHoyEl.innerText = AgendaService.contarCitasHoy(this.citas);
        }
        if (this.countProgEl) {
            this.countProgEl.innerText = this.citas.filter(c => c.estado === ESTADOS_CITA.PROGRAMADA).length;
        }

        this.renderList();
    }

    renderList() {
        const citasFiltradas = AgendaService.filtrarCitas(this.citas, {
            estado: this.filtroEstadoActual,
            busqueda: this.busquedaActual
        });

        const permisos = {
            agendar: this.puede(ACCIONES.CITA_AGENDAR),
            atender: this.puede(ACCIONES.CITA_ATENDER),
            cancelar: this.puede(ACCIONES.CITA_CANCELAR)
        };

        if (this.citasListContainer) {
            this.citasListContainer.innerHTML = renderCitasListHtml(citasFiltradas, permisos);
        }
    }
}
