// js/ui/dashboardView.js
/**
 * Componente de Vista del Dashboard Principal (Capa de Presentación / UI).
 * Genera el marcado HTML y estructura visual de las tarjetas de pacientes y métricas.
 */

import { getMedInfo } from '../core/catalogoMedicamentos.js';

/**
 * Obtiene las infusiones con dosis o velocidad activa en un paciente.
 */
export function getActiveInfusions(patient) {
    if (!patient || !Array.isArray(patient.meds)) return [];
    return patient.meds.filter(m => {
        const d = parseFloat(m.dosis) || 0;
        const v = parseFloat(m.velocidad) || 0;
        return (d > 0 || v > 0) && (m.nombre && m.nombre.trim() !== '');
    });
}

/**
 * Genera el HTML de los chips de medicamentos activos con su color pastel institucional.
 */
export function renderMedChipsHtml(activeMeds) {
    if (!activeMeds || activeMeds.length === 0) {
        return `<span class="chip-empty">Sin infusiones activas</span>`;
    }

    const displayMeds = activeMeds.slice(0, 3);
    const remaining = activeMeds.length - 3;

    let html = displayMeds.map(med => {
        const info = getMedInfo(med.nombre);
        const bgColor = info ? info.color : '#e2e8f0';
        return `<span class="med-chip" style="background-color: ${bgColor};" title="${med.nombre}: ${med.dosis || 0} ${med.unidad || ''} @ ${med.velocidad || 0} ml/h">
            <span class="med-chip-dot"></span>${med.nombre}
        </span>`;
    }).join('');

    if (remaining > 0) {
        html += `<span class="med-chip-more">+${remaining} más</span>`;
    }

    return html;
}

/**
 * Genera el HTML para una tarjeta de paciente en la grilla del Dashboard.
 */
export function renderPatientCardHtml(patient, isActivePatient = false) {
    const activeMeds = getActiveInfusions(patient);
    const pesoNum = parseFloat(patient.peso);
    const pesoDisplay = (!isNaN(pesoNum) && pesoNum > 0)
        ? `<strong>${pesoNum.toFixed(1)}</strong> kg`
        : `<span class="text-warning">Sin registrar</span>`;

    const activeBadge = isActivePatient
        ? `<span class="badge-active-patient" title="Paciente en consulta activa">En Consulta</span>`
        : '';

    return `
        <div class="patient-card ${isActivePatient ? 'is-active-card' : ''}" data-patient-id="${patient.id}">
            <div class="patient-card-header">
                <div class="patient-card-title-group">
                    <span class="patient-icon">👶</span>
                    <h3 class="patient-card-name">${patient.name || `Paciente ${patient.id}`}</h3>
                </div>
                ${activeBadge}
            </div>

            <div class="patient-card-body">
                <div class="patient-card-stat">
                    <span class="stat-icon">⚖️</span>
                    <span class="stat-label">Peso Corporal:</span>
                    <span class="stat-val">${pesoDisplay}</span>
                </div>

                <div class="patient-card-stat">
                    <span class="stat-icon">💉</span>
                    <span class="stat-label">Infusiones en Bomba:</span>
                    <span class="stat-val ${activeMeds.length > 0 ? 'text-primary' : 'text-muted'}">
                        <strong>${activeMeds.length}</strong> activa${activeMeds.length === 1 ? '' : 's'}
                    </span>
                </div>

                <div class="patient-card-chips">
                    ${renderMedChipsHtml(activeMeds)}
                </div>
            </div>

            <div class="patient-card-footer">
                <button type="button" class="btn btn-outline-primary btn-open-calc" data-patient-id="${patient.id}">
                    Abrir Calculadora ➔
                </button>
            </div>
        </div>
    `;
}

/**
 * Genera el estado vacío cuando no existen pacientes guardados.
 */
export function renderEmptyPatientsHtml() {
    return `
        <div class="empty-patients-state">
            <span class="empty-icon">🏥</span>
            <h3>No hay pacientes registrados</h3>
            <p>Comienza agregando un nuevo paciente pediátrico para calcular infusiones continuas.</p>
        </div>
    `;
}
