// js/controllers/historialController.js
/**
 * Controlador del Historial de Reportes de Entrega de Guardia (Capa de Aplicación).
 * Consulta, búsqueda, apertura (para ver / editar observaciones) y baja de reportes guardados.
 * El alta de reportes se realiza desde el modal de reporte (ReporteController).
 */

import { HistorialService } from '../core/historialService.js';
import { PermisosService, ACCIONES } from '../core/permisosService.js';
import { StorageRepository } from '../data/storageRepository.js';
import { renderHistorialListHtml } from '../ui/historialView.js';

export class HistorialController {
    /**
     * @param {Object} options
     * @param {Function} options.onNavigateToDashboard
     * @param {Function} options.onOpenReporte - Callback que recibe el registro a mostrar en el modal
     */
    constructor({ onNavigateToDashboard, onOpenReporte } = {}) {
        this.onNavigateToDashboard = onNavigateToDashboard || null;
        this.onOpenReporte = onOpenReporte || null;

        this.listContainer = document.getElementById('historial-container');
        this.searchInput = document.getElementById('historial-search-input');
        this.countTotalEl = document.getElementById('historial-count-total');
        this.countHoyEl = document.getElementById('historial-count-hoy');
        this.btnBack = document.getElementById('btn-historial-back-dashboard');

        this.reportes = [];
        this.busqueda = '';
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

        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.busqueda = this.searchInput.value;
                this.renderList();
            });
        }

        if (this.listContainer) {
            this.listContainer.addEventListener('click', (e) => {
                const btnVer = e.target.closest('.btn-reporte-ver');
                if (btnVer) {
                    this.handleOpen(parseInt(btnVer.dataset.reporteId, 10));
                    return;
                }
                const btnDelete = e.target.closest('.btn-reporte-delete');
                if (btnDelete) {
                    this.handleDelete(parseInt(btnDelete.dataset.reporteId, 10));
                }
            });
        }
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

        if (this.countTotalEl) this.countTotalEl.innerText = this.reportes.length;
        if (this.countHoyEl) {
            const hoy = new Date().toDateString();
            this.countHoyEl.innerText = this.reportes.filter(r => new Date(r.fechaEmision).toDateString() === hoy).length;
        }

        this.renderList();
    }

    renderList() {
        if (!this.listContainer) return;
        const filtrados = HistorialService.filtrar(this.reportes, this.busqueda);
        const puedeEliminar = PermisosService.puede(StorageRepository.getActiveUser(), ACCIONES.HISTORIAL_ELIMINAR);
        this.listContainer.innerHTML = renderHistorialListHtml(filtrados, { puedeEliminar });
    }
}
