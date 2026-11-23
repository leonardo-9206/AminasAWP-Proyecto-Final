// js/ui/historialView.js
/**
 * Componente de Vista del Historial Clínico (Capa de Presentación / UI).
 * Renderiza:
 *  1. Tarjetas de Reportes de Bombas / Entregas de Guardia guardadas.
 *  2. Expedientes consolidados de todos los Pacientes Consultados (con citas atendidas, canceladas y reportes).
 */

import { ESTADOS_INFO } from '../core/agendaService.js';

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Genera la tarjeta de un reporte de entrega de guardia / bombas guardado.
 */
export function renderReporteCardHtml(reporte, { puedeEliminar = false } = {}) {
    const fecha = new Date(reporte.fechaEmision);
    const fechaTexto = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    const horaTexto = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const pesoNum = parseFloat(reporte.peso);
    const pesoTexto = !isNaN(pesoNum) && pesoNum > 0 ? `${pesoNum.toFixed(1)} kg` : 'Peso sin registrar';
    const infusiones = Array.isArray(reporte.infusiones) ? reporte.infusiones : [];
    const nombresMeds = infusiones.map(m => escapeHtml(m.nombre)).join(', ');

    return `
        <div class="cita-card" data-reporte-id="${reporte.id}">
            <div class="cita-card-header">
                <div class="cita-patient-info">
                    <span class="cita-patient-icon">📄</span>
                    <strong class="cita-patient-name">${escapeHtml(reporte.pacienteNombre)}</strong>
                </div>
                <span class="cita-badge" style="background-color: #e0f2fe; color: #0284c7;">
                    Folio #${reporte.id}
                </span>
            </div>

            <div class="cita-card-body">
                <div class="cita-info-row">
                    <span class="cita-icon">📅</span>
                    <span class="cita-text"><strong>${fechaTexto}</strong> a las <strong>${horaTexto} hrs</strong></span>
                </div>
                <div class="cita-info-row">
                    <span class="cita-icon">⚖️</span>
                    <span class="cita-text">${pesoTexto} · ${infusiones.length} infusión(es) activa(s)</span>
                </div>
                ${nombresMeds ? `
                    <div class="cita-info-row">
                        <span class="cita-icon">💉</span>
                        <span class="cita-text">${nombresMeds}</span>
                    </div>
                ` : ''}
                <div class="cita-info-row">
                    <span class="cita-icon">👤</span>
                    <span class="cita-text">${reporte.emisor ? escapeHtml(reporte.emisor.nombre) : 'Emisor no registrado'}</span>
                </div>
                ${reporte.notas ? `
                    <div class="cita-info-row cita-notas-row">
                        <span class="cita-icon">📝</span>
                        <span class="cita-text"><em>${escapeHtml(reporte.notas)}</em></span>
                    </div>
                ` : ''}
            </div>

            <div class="cita-card-footer">
                <div class="cita-action-group">
                    <button type="button" class="btn btn-sm btn-outline-primary btn-reporte-ver" data-reporte-id="${reporte.id}">
                        👁️ Ver / Editar Observaciones
                    </button>
                    ${puedeEliminar ? `
                        <button type="button" class="btn btn-sm btn-outline-danger btn-reporte-delete" data-reporte-id="${reporte.id}" title="Eliminar reporte del historial">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Genera la lista completa de reportes o el estado vacío.
 */
export function renderHistorialListHtml(reportes, opciones) {
    if (!Array.isArray(reportes) || reportes.length === 0) {
        return `
            <div class="empty-citas-state">
                <span class="empty-icon">🗂️</span>
                <h3>No hay reportes de bombas guardados</h3>
                <p>Desde la calculadora presiona "Generar Reporte / Entrega de Guardia" y luego "Guardar en Historial".</p>
            </div>
        `;
    }
    return reportes.map(r => renderReporteCardHtml(r, opciones)).join('');
}

/**
 * Genera la tarjeta de expediente consolidado de un paciente consultado.
 */
export function renderPacienteExpedienteCardHtml(exp, { puedeCalculadora = false } = {}) {
    const pesoNum = parseFloat(exp.peso);
    const pesoTexto = !isNaN(pesoNum) && pesoNum > 0 ? `${pesoNum.toFixed(1)} kg` : 'Sin registrar';

    let estadoBadge = { label: 'Activo en Servicio', bg: '#dcfce7', color: '#15803d' };
    if (exp.estado === 'DADO_DE_BAJA') {
        estadoBadge = { label: 'Egresado / Baja', bg: '#f1f5f9', color: '#475569' };
    } else if (exp.estado === 'EXTERNO') {
        estadoBadge = { label: 'Consulta Externa', bg: '#fef3c7', color: '#b45309' };
    }

    const citasHtml = exp.citas.length === 0
        ? `<p class="exp-empty-note">Sin citas registradas en agenda.</p>`
        : exp.citas.map(c => {
            const st = ESTADOS_INFO[c.estado] || ESTADOS_INFO.PROGRAMADA;
            return `
                <div class="exp-timeline-item">
                    <div class="exp-timeline-top">
                        <span class="exp-date">📅 ${escapeHtml(c.fecha)} · ${escapeHtml(c.hora)} hrs</span>
                        <span class="cita-badge" style="background-color: ${st.bg}; color: ${st.color};">
                            ${st.icon} ${st.label}
                        </span>
                    </div>
                    <div class="exp-timeline-detail">
                        <strong>${escapeHtml(c.motivo)}</strong> — <span class="text-muted">${escapeHtml(c.medicoResponsable)}</span>
                        ${c.notas ? `<div class="exp-timeline-note">📝 ${escapeHtml(c.notas)}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

    const reportesHtml = exp.reportes.length === 0
        ? `<p class="exp-empty-note">Sin reportes de bombas guardados aún.</p>`
        : exp.reportes.map(r => {
            const f = new Date(r.fechaEmision);
            const fTxt = f.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
            const hTxt = f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const countInf = Array.isArray(r.infusiones) ? r.infusiones.length : 0;
            return `
                <div class="exp-report-row">
                    <div>
                        <strong>Folio #${r.id}</strong> · ${fTxt} (${hTxt}) · ${countInf} infusión(es)
                        ${r.emisor ? `<br><small class="text-muted">Emisor: ${escapeHtml(r.emisor.nombre)}</small>` : ''}
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary btn-reporte-ver" data-reporte-id="${r.id}">
                        👁️ Abrir
                    </button>
                </div>
            `;
        }).join('');

    return `
        <div class="expediente-card">
            <div class="expediente-header">
                <div class="cita-patient-info">
                    <span class="cita-patient-icon">👶</span>
                    <div>
                        <strong class="cita-patient-name">${escapeHtml(exp.nombre)}</strong>
                        <div class="exp-submeta">⚖️ Peso: <strong>${pesoTexto}</strong> ${exp.estado === 'ACTIVO' ? `· 💉 ${exp.infusionesActivas} infusión(es) en bomba` : ''}</div>
                    </div>
                </div>
                <span class="cita-badge" style="background-color: ${estadoBadge.bg}; color: ${estadoBadge.color};">
                    ${estadoBadge.label}
                </span>
            </div>

            <div class="exp-stats-pills">
                <span class="exp-pill">📅 ${exp.citas.length} cita(s)</span>
                <span class="exp-pill exp-pill-ok">✅ ${exp.citasCompletadas} atendida(s)</span>
                <span class="exp-pill exp-pill-cancel">❌ ${exp.citasCanceladas} cancelada(s)</span>
                <span class="exp-pill exp-pill-info">📄 ${exp.reportes.length} reporte(s)</span>
            </div>

            <div class="exp-section">
                <h4 class="exp-section-title">Historial de Citas y Atención</h4>
                <div class="exp-timeline">
                    ${citasHtml}
                </div>
            </div>

            <div class="exp-section">
                <h4 class="exp-section-title">Reportes de Bombas / Guardia</h4>
                <div class="exp-reports-list">
                    ${reportesHtml}
                </div>
            </div>

            ${exp.estado === 'ACTIVO' && exp.id && puedeCalculadora ? `
                <div class="cita-card-footer">
                    <button type="button" class="btn btn-sm btn-outline-primary btn-exp-goto-calc" data-paciente-id="${exp.id}">
                        💉 Ir a Calculadora del Paciente
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Genera la lista completa de expedientes de pacientes consultados.
 */
export function renderPacientesHistorialListHtml(expedientes, opciones) {
    if (!Array.isArray(expedientes) || expedientes.length === 0) {
        return `
            <div class="empty-citas-state">
                <span class="empty-icon">👶</span>
                <h3>No hay pacientes en el historial</h3>
                <p>Conforme registres pacientes, agendes citas o guardes reportes, aparecerá aquí su expediente completo.</p>
            </div>
        `;
    }
    return expedientes.map(exp => renderPacienteExpedienteCardHtml(exp, opciones)).join('');
}
