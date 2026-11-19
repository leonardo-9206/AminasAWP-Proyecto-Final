// js/controllers/dashboardController.js
/**
 * Controlador del Dashboard / Pantalla de Bienvenida (Capa de Aplicación).
 * Gestiona el resumen de pacientes activos, métricas clínicas y navegación inicial.
 */

import { defaultMeds } from '../core/catalogoMedicamentos.js';
import { AgendaService } from '../core/agendaService.js';
import { PermisosService, ACCIONES } from '../core/permisosService.js';
import { StorageRepository } from '../data/storageRepository.js';
import {
    getActiveInfusions,
    renderPatientCardHtml,
    renderEmptyPatientsHtml
} from '../ui/dashboardView.js';

export class DashboardController {
    /**
     * @param {Object} options
     * @param {Function} options.onSelectPatient - Callback al seleccionar un paciente (recibe patientId)
     * @param {Function} options.onNewPatient - Callback al crear un nuevo paciente
     * @param {Function} options.onNavigateToCitas - Callback para navegar al módulo de citas
     */
    constructor({ onSelectPatient, onNewPatient, onNavigateToCitas, onNavigateToHistorial } = {}) {
        this.btnGoHistorial = document.getElementById('btn-dash-go-historial');
        this.onNavigateToHistorial = onNavigateToHistorial;
        this.patientsGrid = document.getElementById('patients-grid');
        this.totalPatientsEl = document.getElementById('dash-total-patients');
        this.activeInfusionsEl = document.getElementById('dash-active-infusions');
        this.citasHoyEl = document.getElementById('dash-citas-hoy');
        this.btnNewPatient = document.getElementById('btn-dash-new-patient');
        this.btnContinue = document.getElementById('btn-dash-continue');
        this.btnGoCitas = document.getElementById('btn-dash-go-citas');
        this.offlineBadge = document.getElementById('offline-badge');
        this.calcOfflineBadge = document.getElementById('calc-offline-badge');

        this.onSelectPatient = onSelectPatient;
        this.onNewPatient = onNewPatient;
        this.onNavigateToCitas = onNavigateToCitas;

        this.activePatientId = null;
    }

    init() {
        this.setupEventListeners();
        this.setupNetworkStatusListeners();
        this.updateNetworkStatus();
        this.render();
    }

    setupEventListeners() {
        if (this.btnNewPatient) {
            this.btnNewPatient.addEventListener('click', () => {
                if (typeof this.onNewPatient === 'function') {
                    this.onNewPatient();
                }
            });
        }

        if (this.btnContinue) {
            this.btnContinue.addEventListener('click', () => {
                if (typeof this.onSelectPatient === 'function') {
                    this.onSelectPatient(this.activePatientId);
                }
            });
        }

        if (this.btnGoCitas) {
            this.btnGoCitas.addEventListener('click', () => {
                if (typeof this.onNavigateToCitas === 'function') {
                    this.onNavigateToCitas();
                }
            });
        }

        if (this.btnGoHistorial) {
            this.btnGoHistorial.addEventListener('click', () => {
                if (typeof this.onNavigateToHistorial === 'function') {
                    this.onNavigateToHistorial();
                }
            });
        }

        if (this.patientsGrid) {
            this.patientsGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.patient-card');
                if (!card) return;

                const patientId = parseInt(card.dataset.patientId, 10);
                if (!isNaN(patientId) && typeof this.onSelectPatient === 'function') {
                    this.onSelectPatient(patientId);
                }
            });
        }
    }

    setupNetworkStatusListeners() {
        window.addEventListener('online', () => this.updateNetworkStatus());
        window.addEventListener('offline', () => this.updateNetworkStatus());
    }

    updateNetworkStatus() {
        const isOnline = navigator.onLine;
        const text = isOnline ? '🟢 Modo Offline Listo' : '🟡 Sin Conexión (Offline)';
        const className = isOnline ? 'offline-badge' : 'offline-badge offline-badge-warning';

        if (this.offlineBadge) {
            this.offlineBadge.innerText = text;
            this.offlineBadge.className = className;
        }

        if (this.calcOfflineBadge) {
            this.calcOfflineBadge.innerText = text;
            this.calcOfflineBadge.className = className;
        }
    }

    render() {
        const appState = StorageRepository.loadAppState(defaultMeds);
        const patients = appState.patients || [];
        this.activePatientId = appState.activePatientId || (patients[0] ? patients[0].id : 1);

        // Calcular métricas agregadas
        const totalPatients = patients.length;
        let totalActiveInfusions = 0;

        patients.forEach(p => {
            totalActiveInfusions += getActiveInfusions(p).length;
        });

        // Actualizar contadores en la interfaz
        if (this.totalPatientsEl) {
            this.totalPatientsEl.innerText = totalPatients;
        }

        if (this.activeInfusionsEl) {
            this.activeInfusionsEl.innerText = totalActiveInfusions;
        }

        if (this.citasHoyEl) {
            const citas = StorageRepository.loadCitas();
            this.citasHoyEl.innerText = AgendaService.contarCitasHoy(citas);
        }

        // Permisos por rol
        const usuario = StorageRepository.getActiveUser();
        const puedeCalculadora = PermisosService.puede(usuario, ACCIONES.CALCULADORA_USAR);
        if (this.btnNewPatient) {
            this.btnNewPatient.style.display = PermisosService.puede(usuario, ACCIONES.PACIENTE_ALTA) ? '' : 'none';
        }

        // Actualizar botón de continuación
        if (this.btnContinue) {
            const activePat = patients.find(p => p.id === this.activePatientId) || patients[0];
            if (activePat && puedeCalculadora) {
                this.btnContinue.style.display = 'inline-flex';
                this.btnContinue.innerHTML = `<span>➔</span> Continuar con <strong>${activePat.name}</strong>`;
            } else {
                this.btnContinue.style.display = 'none';
            }
        }

        // Renderizar tarjetas de pacientes
        if (this.patientsGrid) {
            if (patients.length === 0) {
                this.patientsGrid.innerHTML = renderEmptyPatientsHtml();
            } else {
                this.patientsGrid.innerHTML = patients
                    .map(p => renderPatientCardHtml(p, p.id === this.activePatientId))
                    .join('');
            }
        }
    }
}
