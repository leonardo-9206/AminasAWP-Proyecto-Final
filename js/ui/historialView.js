// js/ui/historialView.js
/**
 * Componente de Vista del Historial de Reportes de Entrega de Guardia (Capa de Presentación / UI).
 * Reutiliza los estilos de tarjeta del módulo de citas.
 */

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Genera la tarjeta de un reporte guardado.
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
 * Genera la lista completa o el estado vacío.
 */
export function renderHistorialListHtml(reportes, opciones) {
    if (!Array.isArray(reportes) || reportes.length === 0) {
        return `
            <div class="empty-citas-state">
                <span class="empty-icon">🗂️</span>
                <h3>No hay reportes guardados</h3>
                <p>Desde la calculadora usa "Generar Reporte / Entrega de Guardia" y después "Guardar en Historial".</p>
            </div>
        `;
    }
    return reportes.map(r => renderReporteCardHtml(r, opciones)).join('');
}
