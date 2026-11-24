// js/ui/citasView.js
/**
 * Componente de Vista del Módulo de Citas y Agenda (Capa de Presentación / UI).
 * Genera el marcado HTML para la lista de citas, badges de estado y selectores.
 */

import { AgendaService, ESTADOS_INFO, ESTADOS_CITA, MEDICOS_DISPONIBLES, MOTIVOS_SUGERIDOS } from '../core/agendaService.js';

/**
 * Genera el HTML de la tarjeta de una cita médica.
 */
export function renderCitaCardHtml(cita, permisos = { agendar: true, atender: true, cancelar: true, usuarioActivo: null }) {
    const estadoInfo = ESTADOS_INFO[cita.estado] || ESTADOS_INFO.PROGRAMADA;
    const esActiva = cita.estado === ESTADOS_CITA.PROGRAMADA || cita.estado === ESTADOS_CITA.EN_CURSO;
    const esAsignado = AgendaService.esMedicoAsignado(cita, permisos.usuarioActivo);
    const puedeAtenderEsta = permisos.atender && esAsignado;

    return `
        <div class="cita-card cita-status-${cita.estado.toLowerCase()}" data-cita-id="${cita.id}">
            <div class="cita-card-header">
                <div class="cita-patient-info">
                    <span class="cita-patient-icon">👶</span>
                    <strong class="cita-patient-name">${cita.pacienteNombre}</strong>
                </div>
                <span class="cita-badge" style="background-color: ${estadoInfo.bg}; color: ${estadoInfo.color};">
                    ${estadoInfo.icon} ${estadoInfo.label}
                </span>
            </div>

            <div class="cita-card-body">
                <div class="cita-info-row">
                    <span class="cita-icon">📅</span>
                    <span class="cita-text"><strong>${cita.fecha}</strong> a las <strong>${cita.hora} hrs</strong></span>
                </div>

                <div class="cita-info-row">
                    <span class="cita-icon">🩺</span>
                    <span class="cita-text">${cita.medicoResponsable}</span>
                </div>

                <div class="cita-info-row cita-motivo-row">
                    <span class="cita-icon">🎯</span>
                    <span class="cita-text"><strong>Motivo:</strong> ${cita.motivo}</span>
                </div>

                ${cita.notas ? `
                    <div class="cita-info-row cita-notas-row">
                        <span class="cita-icon">📝</span>
                        <span class="cita-text"><em>${cita.notas}</em></span>
                    </div>
                ` : ''}
            </div>

            <div class="cita-card-footer">
                <div class="cita-action-group">
                    ${cita.pacienteId ? `
                        <button type="button" class="btn btn-sm btn-outline-primary btn-cita-goto-calc" data-paciente-id="${cita.pacienteId}" title="Ir a la calculadora de este paciente">
                            💉 Ver Bombas
                        </button>
                    ` : ''}
                    
                    ${permisos.agendar && esActiva ? `
                        <button type="button" class="btn btn-sm btn-outline-primary btn-cita-edit" data-cita-id="${cita.id}" title="Editar o reprogramar la cita">
                            ✏️ Editar / Reprogramar
                        </button>
                    ` : ''}

                    ${puedeAtenderEsta && cita.estado === ESTADOS_CITA.PROGRAMADA ? `
                        <button type="button" class="btn btn-sm btn-outline-warning btn-cita-change-state" data-cita-id="${cita.id}" data-new-state="${ESTADOS_CITA.EN_CURSO}">
                            🩺 Atender
                        </button>
                    ` : ''}

                    ${puedeAtenderEsta && cita.estado === ESTADOS_CITA.EN_CURSO ? `
                        <button type="button" class="btn btn-sm btn-outline-success btn-cita-change-state" data-cita-id="${cita.id}" data-new-state="${ESTADOS_CITA.COMPLETADA}">
                            ✅ Concluir
                        </button>
                    ` : ''}

                    ${permisos.atender && esActiva && !esAsignado ? `
                        <span class="cita-lock-note" title="Solo el especialista asignado puede atender o concluir esta interconsulta">
                            🔒 Solo médico asignado
                        </span>
                    ` : ''}

                    ${permisos.cancelar && esActiva ? `
                        <button type="button" class="btn btn-sm btn-outline-danger btn-cita-change-state" data-cita-id="${cita.id}" data-new-state="${ESTADOS_CITA.CANCELADA}">
                            ❌ Cancelar
                        </button>
                    ` : ''}

                    ${permisos.cancelar ? `
                        <button type="button" class="btn btn-sm btn-outline-danger btn-cita-delete" data-cita-id="${cita.id}" title="Eliminar registro">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Genera el HTML de la lista de citas.
 */
export function renderCitasListHtml(citas, permisos) {
    if (!Array.isArray(citas) || citas.length === 0) {
        return renderEmptyCitasHtml();
    }
    return citas.map(c => renderCitaCardHtml(c, permisos)).join('');
}

/**
 * Estado vacío para cuando no hay citas que coincidan con los filtros.
 */
export function renderEmptyCitasHtml() {
    return `
        <div class="empty-citas-state">
            <span class="empty-icon">📅</span>
            <h3>No hay citas registradas</h3>
            <p>Utiliza el formulario superior para programar una nueva cita médica o control de infusión.</p>
        </div>
    `;
}

/**
 * Llena el selector de pacientes en el formulario de citas.
 */
export function populatePacientesSelect(selectEl, patients = []) {
    if (!selectEl) return;
    selectEl.innerHTML = `
        <option value="">-- Seleccionar Paciente Registrado --</option>
        ${patients.map(p => `
            <option value="${p.id}" data-name="${p.name || `Paciente ${p.id}`}">
                👶 ${p.name || `Paciente ${p.id}`} ${p.peso ? `(${p.peso} kg)` : ''}
            </option>
        `).join('')}
        <option value="OTRO">➕ Otro paciente (ingresar nombre)...</option>
    `;
}

/**
 * Llena el selector de médicos.
 */
export function populateMedicosSelect(selectEl, medicos = MEDICOS_DISPONIBLES) {
    if (!selectEl) return;
    selectEl.innerHTML = `
        <option value="">-- Seleccionar Profesional Responsable --</option>
        ${medicos.map(m => `
            <option value="${m}">${m}</option>
        `).join('')}
    `;
}

/**
 * Llena las opciones sugeridas de motivos.
 */
export function populateMotivosDatalist(datalistEl) {
    if (!datalistEl) return;
    datalistEl.innerHTML = MOTIVOS_SUGERIDOS.map(motivo => `
        <option value="${motivo}"></option>
    `).join('');
}
