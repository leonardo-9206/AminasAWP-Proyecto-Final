// js/controllers/citasController.js
/**
 * Controlador del Módulo de Citas y Agenda (Capa de Aplicación).
 * Gestiona el agendamiento, transiciones de estado, filtros y persistencia en LocalStorage.
 */

import { defaultMeds } from '../core/catalogoMedicamentos.js';
import { AgendaService, ESTADOS_CITA } from '../core/agendaService.js';
import { StorageRepository } from '../data/storageRepository.js';
import {
    renderCitasListHtml,
    populatePacientesSelect,
    populateMedicosSelect,
    populateMotivosDatalist
} from '../ui/citasView.js';

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
        this.btnToggleForm = document.getElementById('btn-toggle-form-cita');
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
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDateTime();
        this.render();
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
                this.formWrapper.style.display = isHidden ? 'block' : 'none';
                this.btnToggleForm.innerHTML = isHidden
                    ? '<span>▲</span> Ocultar Formulario'
                    : '<span>➕</span> Nueva Cita Pediátrica';
            });
        }

        // Cambio en selector de paciente (si selecciona OTRO, muestra input de texto libre)
        if (this.pacienteSelect) {
            this.pacienteSelect.addEventListener('change', () => {
                if (this.pacienteSelect.value === 'OTRO') {
                    if (this.customNombreGroup) this.customNombreGroup.style.display = 'block';
                    if (this.customNombreInput) this.customNombreInput.focus();
                } else {
                    if (this.customNombreGroup) this.customNombreGroup.style.display = 'none';
                }
            });
        }

        // Envío del formulario
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateCita();
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

    handleCreateCita() {
        let pacienteId = null;
        let pacienteNombre = '';

        if (this.pacienteSelect.value === 'OTRO') {
            pacienteNombre = this.customNombreInput ? this.customNombreInput.value.trim() : '';
        } else if (this.pacienteSelect.value) {
            pacienteId = parseInt(this.pacienteSelect.value, 10);
            const selectedOpt = this.pacienteSelect.options[this.pacienteSelect.selectedIndex];
            pacienteNombre = selectedOpt ? selectedOpt.dataset.name : `Paciente ${pacienteId}`;
        }

        const citaData = {
            pacienteId,
            pacienteNombre,
            medicoResponsable: this.medicoSelect.value.trim(),
            fecha: this.fechaInput.value.trim(),
            hora: this.horaInput.value.trim(),
            motivo: this.motivoInput.value.trim(),
            notas: this.notasInput ? this.notasInput.value.trim() : '',
            estado: ESTADOS_CITA.PROGRAMADA
        };

        const validacion = AgendaService.validarCita(citaData);
        if (!validacion.valido) {
            this.showFormAlert(validacion.errores.join(' '));
            return;
        }

        this.hideFormAlert();

        const nuevoId = AgendaService.generarSiguienteId(this.citas);
        const nuevaCita = { id: nuevoId, ...citaData };

        this.citas.unshift(nuevaCita);
        StorageRepository.saveCitas(this.citas);

        // Resetear formulario
        this.form.reset();
        if (this.customNombreGroup) this.customNombreGroup.style.display = 'none';
        this.setDefaultDateTime();

        // Ocultar formulario para ver la lista de inmediato
        if (this.formWrapper) {
            this.formWrapper.style.display = 'none';
            if (this.btnToggleForm) {
                this.btnToggleForm.innerHTML = '<span>➕</span> Nueva Cita Pediátrica';
            }
        }

        this.render();
    }

    handleChangeState(citaId, newState) {
        const cita = this.citas.find(c => c.id === citaId);
        if (!cita) return;

        cita.estado = newState;
        StorageRepository.saveCitas(this.citas);
        this.render();
    }

    handleDeleteCita(citaId) {
        const cita = this.citas.find(c => c.id === citaId);
        const nombre = cita ? cita.pacienteNombre : 'esta cita';

        if (confirm(`¿Estás seguro de eliminar el registro de cita para ${nombre}?`)) {
            this.citas = this.citas.filter(c => c.id !== citaId);
            StorageRepository.saveCitas(this.citas);
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

        // Cargar pacientes activos para llenar selectores
        const appState = StorageRepository.loadAppState(defaultMeds);
        const patients = appState.patients || [];

        populatePacientesSelect(this.pacienteSelect, patients);
        populateMedicosSelect(this.medicoSelect);
        populateMotivosDatalist(this.motivosDatalist);

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

        if (this.citasListContainer) {
            this.citasListContainer.innerHTML = renderCitasListHtml(citasFiltradas);
        }
    }
}
