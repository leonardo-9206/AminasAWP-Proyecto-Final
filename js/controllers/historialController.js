// js/controllers/historialController.js
/**
 * Controlador del Historial Clínico Unificado (Capa de Aplicación).
 * Administra dos pestañas:
 *  1. Reportes de Bombas / Entregas de Guardia guardados.
 *  2. Expediente de Pacientes Consultados (con citas atendidas, canceladas, programadas y reportes).
 */

import { defaultMeds } from '../core/catalogoMedicamentos.js';
import { HistorialService } from '../core/historialService.js';
import { PermisosService, ACCIONES } from '../core/permisosService.js';
import { StorageRepository } from '../data/storageRepository.js';
import {
    renderHistorialListHtml,
    renderPacientesHistorialListHtml
} from '../ui/historialView.js';

export class HistorialController {
    /**
     * @param {Object} options
     * @param {Function} options.onNavigateToDashboard
     * @param {Function} options.onNavigateToCalculadora
     * @param {Function} options.onOpenReporte - Callback que recibe el registro a mostrar en el modal
     */
    constructor({ onNavigateToDashboard, onNavigateToCalculadora, onOpenReporte } = {}) {
        this.onNavigateToDashboard = onNavigateToDashboard || null;
        this.onNavigateToCalculadora = onNavigateToCalculadora || null;
        this.onOpenReporte = onOpenReporte || null;

        this.listContainer = document.getElementById('historial-container');
        this.pacientesContainer = document.getElementById('historial-pacientes-container');
        this.searchInput = document.getElementById('historial-search-input');

        this.tabReportesBtn = document.getElementById('historial-tab-reportes');
        this.tabPacientesBtn = document.getElementById('historial-tab-pacientes');

        this.countTotalEl = document.getElementById('historial-count-total');
        this.countHoyEl = document.getElementById('historial-count-hoy');
        this.countPacientesEl = document.getElementById('historial-count-pacientes');
        this.btnBack = document.getElementById('btn-historial-back-dashboard');

        this.reportes = [];
        this.expedientes = [];
        this.busqueda = '';
        this.activeTab = 'reportes'; // 'reportes' | 'pacientes'
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        if (this.btnBack) {
            this.btnBack.addEventListener('click', () => {
                if (typeof this.onNavigateToDashboard === 'function') this.onNavigateToDashboard();
            });
        }

        if (this.tabReportesBtn) {
            this.tabReportesBtn.addEventListener('click', () => this.switchTab('reportes'));
        }

        if (this.tabPacientesBtn) {
            this.tabPacientesBtn.addEventListener('click', () => this.switchTab('pacientes'));
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.busqueda = this.searchInput.value;
                this.renderLists();
            });
        }

        const handleCardClicks = (e) => {
            const btnVer = e.target.closest('.btn-reporte-ver');
            if (btnVer) {
                this.handleOpen(parseInt(btnVer.dataset.reporteId, 10));
                return;
            }
            const btnDelete = e.target.closest('.btn-reporte-delete');
            if (btnDelete) {
                this.handleDelete(parseInt(btnDelete.dataset.reporteId, 10));
                return;
            }
            const btnCalc = e.target.closest('.btn-exp-goto-calc');
            if (btnCalc) {
                const pacienteId = parseInt(btnCalc.dataset.pacienteId, 10);
                if (!isNaN(pacienteId) && typeof this.onNavigateToCalculadora === 'function') {
                    this.onNavigateToCalculadora(pacienteId);
                }
            }
        };

        if (this.listContainer) this.listContainer.addEventListener('click', handleCardClicks);
        if (this.pacientesContainer) this.pacientesContainer.addEventListener('click', handleCardClicks);
    }

    switchTab(tabName) {
        this.activeTab = tabName === 'pacientes' ? 'pacientes' : 'reportes';

        if (this.tabReportesBtn) this.tabReportesBtn.classList.toggle('active', this.activeTab === 'reportes');
        if (this.tabPacientesBtn) this.tabPacientesBtn.classList.toggle('active', this.activeTab === 'pacientes');

        if (this.listContainer) this.listContainer.style.display = this.activeTab === 'reportes' ? 'grid' : 'none';
        if (this.pacientesContainer) this.pacientesContainer.style.display = this.activeTab === 'pacientes' ? 'grid' : 'none';
    }

    handleOpen(reporteId) {
        const registro = this.reportes.find(r => r.id === reporteId);
        if (registro && typeof this.onOpenReporte === 'function') {
            this.onOpenReporte(registro);
        }
    }

    handleDelete(reporteId) {
        const usuario = StorageRepository.getActiveUser();
        if (!PermisosService.puede(usuario, ACCIONES.HISTORIAL_ELIMINAR)) {
            alert(PermisosService.mensajeDenegado(usuario));
            return;
        }

        const registro = this.reportes.find(r => r.id === reporteId);
        if (!registro) return;

        if (confirm(`¿Eliminar el reporte #${registro.id} de ${registro.pacienteNombre}? Esta acción no se puede deshacer.`)) {
            this.reportes = this.reportes.filter(r => r.id !== reporteId);
            StorageRepository.saveHistorial(this.reportes);
            this.render();
        }
    }

    render() {
        this.reportes = StorageRepository.loadHistorial();
        const appState = StorageRepository.loadAppState(defaultMeds);
        const pacientesActivos = appState.patients || [];
        const pacientesArchivo = StorageRepository.loadPacientesHistorial();
        const citas = StorageRepository.loadCitas();

        this.expedientes = HistorialService.consolidarPacientes({
            pacientesActivos,
            pacientesArchivo,
            citas,
            reportes: this.reportes
        });

        if (this.countTotalEl) this.countTotalEl.innerText = this.reportes.length;
        if (this.countHoyEl) {
            const hoy = new Date().toDateString();
            this.countHoyEl.innerText = this.reportes.filter(r => new Date(r.fechaEmision).toDateString() === hoy).length;
        }
        if (this.countPacientesEl) this.countPacientesEl.innerText = this.expedientes.length;

        this.renderLists();
        this.switchTab(this.activeTab);
    }

    renderLists() {
        const usuario = StorageRepository.getActiveUser();
        const puedeEliminar = PermisosService.puede(usuario, ACCIONES.HISTORIAL_ELIMINAR);
        const puedeCalculadora = PermisosService.puede(usuario, ACCIONES.CALCULADORA_USAR);

        if (this.listContainer) {
            const filtrados = HistorialService.filtrar(this.reportes, this.busqueda);
            this.listContainer.innerHTML = renderHistorialListHtml(filtrados, { puedeEliminar });
        }

        if (this.pacientesContainer) {
            const expFiltrados = HistorialService.filtrarPacientes(this.expedientes, this.busqueda);
            this.pacientesContainer.innerHTML = renderPacientesHistorialListHtml(expFiltrados, { puedeCalculadora });
        }
    }
}
