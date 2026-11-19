// js/controllers/reporteController.js
/**
 * Controlador de Reportes y Entrega de Guardia (Capa de Aplicación).
 * Orquesta la apertura del modal, renderizado de la ficha médica, impresión y copia a WhatsApp.
 */

import {
    getActiveInfusionsForReport,
    renderReportCardHtml,
    generateWhatsAppReportText
} from '../ui/modalReporteView.js';

export class ReporteController {
    constructor() {
        this.modalOverlay = document.getElementById('modal-reporte');
        this.modalContent = document.getElementById('modal-reporte-content');
        this.btnClose = document.getElementById('btn-modal-close');
        this.btnCancel = document.getElementById('btn-modal-cancel');
        this.btnPrint = document.getElementById('btn-modal-print-pdf');
        this.btnCopyWhatsApp = document.getElementById('btn-modal-copy-whatsapp');
        this.toastFeedback = document.getElementById('copy-feedback-toast');

        this.currentPatient = null;
        this.activeMeds = [];

        this.initEventListeners();
    }

    initEventListeners() {
        if (this.btnClose) {
            this.btnClose.addEventListener('click', () => this.close());
        }

        if (this.btnCancel) {
            this.btnCancel.addEventListener('click', () => this.close());
        }

        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.modalOverlay) {
                    this.close();
                }
            });
        }

        if (this.btnPrint) {
            this.btnPrint.addEventListener('click', () => {
                window.print();
            });
        }

        if (this.btnCopyWhatsApp) {
            this.btnCopyWhatsApp.addEventListener('click', () => {
                this.copyWhatsAppSummary();
            });
        }

        // Permitir cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    isOpen() {
        return this.modalOverlay && this.modalOverlay.style.display !== 'none';
    }

    /**
     * Abre el modal y renderiza el reporte del paciente proporcionado.
     * @param {Object} patient
     */
    open(patient) {
        if (!patient) return;

        this.currentPatient = patient;
        this.activeMeds = getActiveInfusionsForReport(patient);

        if (this.modalContent) {
            this.modalContent.innerHTML = renderReportCardHtml(patient, this.activeMeds);
        }

        if (this.modalOverlay) {
            this.modalOverlay.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }

    /**
     * Cierra el modal de reporte.
     */
    close() {
        if (this.modalOverlay) {
            this.modalOverlay.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
        if (this.toastFeedback) {
            this.toastFeedback.style.display = 'none';
        }
    }

    /**
     * Copia al portapapeles el resumen estructurado para WhatsApp.
     */
    async copyWhatsAppSummary() {
        if (!this.currentPatient) return;

        const notesEl = document.getElementById('report-custom-notes');
        const customNotes = notesEl ? notesEl.value : '';

        const textToCopy = generateWhatsAppReportText(this.currentPatient, this.activeMeds, customNotes);

        let success = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                success = true;
            } catch (err) {
                console.warn('[ReporteController] Error con clipboard API, intentando fallback:', err);
            }
        }

        if (!success) {
            // Fallback para entornos donde clipboard API no esté disponible
            try {
                const tempTextArea = document.createElement('textarea');
                tempTextArea.value = textToCopy;
                tempTextArea.style.position = 'fixed';
                tempTextArea.style.left = '-9999px';
                document.body.appendChild(tempTextArea);
                tempTextArea.select();
                success = document.execCommand('copy');
                document.body.removeChild(tempTextArea);
            } catch (fallbackErr) {
                console.error('[ReporteController] Fallback de copia falló:', fallbackErr);
            }
        }

        this.showCopyFeedback(success);
    }

    /**
     * Muestra feedback visual temporal de confirmación.
     */
    showCopyFeedback(isSuccess) {
        if (!this.toastFeedback) return;

        if (isSuccess) {
            this.toastFeedback.innerText = '✅ ¡Reporte copiado al portapapeles! Listo para pegar en WhatsApp o notas.';
            this.toastFeedback.className = 'copy-toast copy-toast-success';
        } else {
            this.toastFeedback.innerText = '⚠️ No se pudo copiar automáticamente. Por favor copia el texto manualmente.';
            this.toastFeedback.className = 'copy-toast copy-toast-warning';
        }

        this.toastFeedback.style.display = 'block';

        setTimeout(() => {
            if (this.toastFeedback) {
                this.toastFeedback.style.display = 'none';
            }
        }, 3500);
    }
}
