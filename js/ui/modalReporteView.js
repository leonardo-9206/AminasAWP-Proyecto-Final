// js/ui/modalReporteView.js
/**
 * Componente de Vista del Reporte de Guardia / Ficha Médica (Capa de Presentación / UI).
 * Genera el marcado HTML para visualización e impresión, así como el texto para WhatsApp.
 */

import { getMedInfo } from '../core/catalogoMedicamentos.js';
import { getDecimals } from '../core/calculoFisiologico.js';

/**
 * Filtra las infusiones que están activas (dosis > 0 o velocidad > 0).
 */
export function getActiveInfusionsForReport(patient) {
    if (!patient || !Array.isArray(patient.meds)) return [];
    return patient.meds.filter(m => {
        const d = parseFloat(m.dosis) || 0;
        const v = parseFloat(m.velocidad) || 0;
        return (d > 0 || v > 0) && (m.nombre && m.nombre.trim() !== '');
    });
}

/**
 * Genera el HTML de la Ficha Médica / Ticket de entrega de turno.
 */
export function renderReportCardHtml(patient, activeMeds, emissionDate = new Date(), activeUser = null, notas = '', folio = null) {
    const notasEscapadas = String(notas || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const fecha = emissionDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const hora = emissionDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const pesoNum = parseFloat(patient.peso);
    const pesoTexto = (!isNaN(pesoNum) && pesoNum > 0)
        ? `${pesoNum.toFixed(1)} kg`
        : 'No especificado';

    let tableRowsHtml = '';
    if (activeMeds.length === 0) {
        tableRowsHtml = `
            <tr>
                <td colspan="5" class="report-empty-row">
                    ⚠️ No hay infusiones continuas activas registradas para este paciente.
                </td>
            </tr>
        `;
    } else {
        tableRowsHtml = activeMeds.map(m => {
            const info = getMedInfo(m.nombre);
            const tagColor = info ? info.color : '#e2e8f0';
            const decimals = getDecimals(m.nombre, 2);

            const dosisVal = parseFloat(m.dosis) || 0;
            const velVal = parseFloat(m.velocidad) || 0;
            const farmacoVal = parseFloat(m.farmaco) || 0;
            const diluyenteVal = parseFloat(m.diluyente) || 0;

            const eq1 = parseFloat(m.equiv) || dosisVal; // si ya viene o calculada
            const vel2 = parseFloat(m.velocidad2) || 2;
            const eq2 = parseFloat(m.equiv2) || 0;

            return `
                <tr>
                    <td class="report-col-med">
                        <span class="report-med-badge" style="background-color: ${tagColor};">
                            ${m.nombre}
                        </span>
                    </td>
                    <td class="report-col-dosis">
                        <strong>${dosisVal.toFixed(decimals)}</strong> <small>${m.unidad || 'mcg/kg/min'}</small>
                    </td>
                    <td class="report-col-vel">
                        <strong>${velVal.toFixed(1)}</strong> ml/h
                    </td>
                    <td class="report-col-prep">
                        ${farmacoVal > 0 ? `${farmacoVal} ${m.farmaco_unidad || 'mg'}` : 'N/D'} en ${diluyenteVal} ml
                        <br><small class="text-muted">Vol. Final: ${diluyenteVal} ml</small>
                    </td>
                    <td class="report-col-eq">
                        1 ml/h = ${eq1 > 0 ? eq1.toFixed(1) : '-'} ${m.equiv_unidad || m.unidad}
                        ${vel2 > 0 && eq2 > 0 ? `<br><small class="text-muted">V2 (${vel2} ml/h) = ${eq2.toFixed(1)}</small>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    return `
        <article class="report-ticket" id="printable-report">
            <header class="report-ticket-header">
                <div class="report-institution">
                    <span class="report-cross">🏥</span>
                    <div>
                        <h2 class="report-inst-title">AMINAS PWA - SISTEMA DE INFUSIONES</h2>
                        <p class="report-inst-subtitle">Ficha Médica / Reporte Oficial de Entrega de Guardia</p>
                    </div>
                </div>
                <div class="report-meta">
                    <div><strong>Fecha:</strong> ${fecha}</div>
                    <div><strong>Hora:</strong> ${hora}</div>
                    ${folio ? `<div><strong>Folio:</strong> #${folio}</div>` : ''}
                </div>
            </header>

            <section class="report-patient-banner">
                <div class="patient-banner-item">
                    <span class="banner-lbl">Paciente:</span>
                    <span class="banner-val">${patient.name || 'Paciente sin nombre'}</span>
                </div>
                <div class="patient-banner-item">
                    <span class="banner-lbl">Peso Corporal:</span>
                    <span class="banner-val highlight">${pesoTexto}</span>
                </div>
                <div class="patient-banner-item">
                    <span class="banner-lbl">Infusiones Activas:</span>
                    <span class="banner-val">${activeMeds.length} en bomba</span>
                </div>
            </section>

            <section class="report-table-section">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Medicamento</th>
                            <th>Dosis Real</th>
                            <th>Velocidad</th>
                            <th>Preparación / Dilución</th>
                            <th>Equivalencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </section>

            <section class="report-notes-section">
                <label for="report-custom-notes" class="report-notes-label">
                    📝 Observaciones Clínicas / Pendientes de Turno:
                </label>
                <textarea id="report-custom-notes" class="report-notes-input" rows="2" placeholder="Ej: Vía central permeable en subclavia derecha. Paciente hemodinámicamente estable, balance horario sin eventualidades...">${notasEscapadas}</textarea>
            </section>

            <footer class="report-ticket-footer">
                <div class="signature-block">
                    <div class="signature-line">
                        ${activeUser ? `<span class="signature-text">${activeUser.nombre} (Céd. ${activeUser.cedula})</span>` : ''}
                    </div>
                    <span class="signature-label">Firma: ${activeUser ? activeUser.rolLabel : 'Profesional Emisor'}</span>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <span class="signature-label">Firma de Recepción de Guardia</span>
                </div>
            </footer>
        </article>
    `;
}

/**
 * Genera el texto estructurado con formato enriquecido para WhatsApp.
 */
export function generateWhatsAppReportText(patient, activeMeds, customNotes = '', activeUser = null, emissionDate = new Date()) {
    const now = emissionDate;
    const fecha = now.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const hora = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const pesoNum = parseFloat(patient.peso);
    const pesoTexto = (!isNaN(pesoNum) && pesoNum > 0) ? `${pesoNum.toFixed(1)} kg` : 'Sin registrar';

    let text = `📋 *ENTREGA DE GUARDIA - AMINAS PWA*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👶 *Paciente:* ${patient.name || 'Paciente 1'}\n`;
    text += `⚖️ *Peso:* ${pesoTexto}\n`;
    text += `📅 *Fecha/Hora:* ${fecha} - ${hora}\n`;
    if (activeUser) {
        text += `👤 *Emisor:* ${activeUser.nombre} (${activeUser.rolLabel} | Céd. ${activeUser.cedula})\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💉 *INFUSIONES ACTIVAS (${activeMeds.length}):*\n`;

    if (activeMeds.length === 0) {
        text += `_No hay infusiones continuas activas._\n`;
    } else {
        activeMeds.forEach((m, idx) => {
            const dosis = parseFloat(m.dosis) || 0;
            const vel = parseFloat(m.velocidad) || 0;
            const farmaco = parseFloat(m.farmaco) || 0;
            const diluyente = parseFloat(m.diluyente) || 0;
            const fUnidad = m.farmaco_unidad || 'mg';
            const dUnidad = m.unidad || 'mcg/kg/min';

            text += `\n*${idx + 1}. ${m.nombre.toUpperCase()}*\n`;
            text += `  • *Dosis:* ${dosis} ${dUnidad}\n`;
            text += `  • *Velocidad:* ${vel} ml/h\n`;
            if (farmaco > 0 && diluyente > 0) {
                text += `  • _Dilución:_ ${farmaco} ${fUnidad} en ${diluyente} ml\n`;
            }
            if (m.equiv && parseFloat(m.equiv) > 0) {
                text += `  • _Equiv 1 ml/h:_ ${m.equiv} ${m.equiv_unidad || dUnidad}\n`;
            }
        });
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    const cleanNotes = customNotes.trim();
    if (cleanNotes) {
        text += `📝 *Observaciones:*\n${cleanNotes}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    }
    text += `_Generado con Aminas PWA (Offline Hospitalario)_`;

    return text;
}
