// js/controllers/reporteController.js
/**
 * Controlador de Reportes y Entrega de Guardia (Capa de Aplicación).
 * Orquesta la apertura del modal, renderizado de la ficha médica, impresión, copia a WhatsApp
 * y el guardado / actualización del reporte en el Historial de Entregas de Guardia.
 */

import {
    getActiveInfusionsForReport,
    renderReportCardHtml,
    generateWhatsAppReportText
} from '../ui/modalReporteView.js';
import { HistorialService } from '../core/historialService.js';
import { PermisosService, ACCIONES } from '../core/permisosService.js';
import { StorageRepository } from '../data/storageRepository.js';

export class ReporteController {
    /**
     * @param {Object} options
     * @param {Function} options.onHistorialChanged - Callback cuando se agrega o modifica un reporte del historial
     */
    constructor({ onHistorialChanged } = {}) {
        this.onHistorialChanged = onHistorialChanged || null;

        this.modalOverlay = document.getElementById('modal-reporte');
        this.modalContent = document.getElementById('modal-reporte-content');
        this.btnClose = document.getElementById('btn-modal-close');
        this.btnCancel = document.getElementById('btn-modal-cancel');
        this.btnPrint = document.getElementById('btn-modal-print-pdf');
        this.btnCopyWhatsApp = document.getElementById('btn-modal-copy-whatsapp');
        this.btnSaveHistorial = document.getElementById('btn-modal-save-historial');
        this.toastFeedback = document.getElementById('copy-feedback-toast');

        this.currentPatient = null;
        this.activeMeds = [];
        this.emissionDate = new Date();
        this.registroHistorialId = null; // null = reporte nuevo; número = reporte abierto desde historial

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

        if (this.btnSaveHistorial) {
            this.btnSaveHistorial.addEventListener('click', () => {
                this.saveToHistorial();
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
     * Abre el modal y renderiza un reporte NUEVO del paciente proporcionado.
     * @param {Object} patient
     * @param {Object} activeUser - Profesional emisor activo
     */
    open(patient, activeUser = null) {
        if (!patient) return;

        this.currentPatient = patient;
        this.activeUser = activeUser;
        this.activeMeds = getActiveInfusionsForReport(patient);
        this.emissionDate = new Date();
        this.registroHistorialId = null;

        this.renderModal('');
    }

    /**
     * Abre un reporte YA GUARDADO en el historial (consulta / edición de observaciones).
     * @param {Object} registro - Registro del historial
     */
    openFromHistorial(registro) {
        if (!registro) return;

        this.currentPatient = HistorialService.aPaciente(registro);
        this.activeUser = registro.emisor;
        this.activeMeds = registro.infusiones || [];
        this.emissionDate = new Date(registro.fechaEmision);
        this.registroHistorialId = registro.id;

        this.renderModal(registro.notas || '', registro.id);
    }

    renderModal(notas, folio = null) {
        if (this.modalContent) {
            this.modalContent.innerHTML = renderReportCardHtml(
                this.currentPatient, this.activeMeds, this.emissionDate, this.activeUser, notas, folio
            );
        }

        if (this.btnSaveHistorial) {
            const puedeGuardar = PermisosService.puede(StorageRepository.getActiveUser(), ACCIONES.REPORTE_GENERAR);
            this.btnSaveHistorial.style.display = puedeGuardar ? '' : 'none';
            this.btnSaveHistorial.innerHTML = this.registroHistorialId !== null
                ? '<span class="btn-icon">💾</span> Actualizar Observaciones'
                : '<span class="btn-icon">💾</span> Guardar en Historial';
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

    getCustomNotes() {
        const notesEl = document.getElementById('report-custom-notes');
        return notesEl ? notesEl.value : '';
    }

    /**
     * Alta (reporte nuevo) o Cambio (actualizar observaciones) en el historial de entregas de guardia.
     */
    saveToHistorial() {
        if (!this.currentPatient) return;

        if (!PermisosService.puede(StorageRepository.getActiveUser(), ACCIONES.REPORTE_GENERAR)) {
            this.showToast(PermisosService.mensajeDenegado(StorageRepository.getActiveUser()), false);
            return;
        }

        const reportes = StorageRepository.loadHistorial();
        const notas = this.getCustomNotes();

        if (this.registroHistorialId !== null) {
            const registro = reportes.find(r => r.id === this.registroHistorialId);
            if (!registro) {
                this.showToast('⚠️ El reporte ya no existe en el historial.', false);
                return;
            }
            registro.notas = notas.trim();
            registro.fechaModificacion = new Date().toISOString();
            StorageRepository.saveHistorial(reportes);
            this.showToast(`✅ Observaciones del reporte #${registro.id} actualizadas.`, true);
        } else {
            const registro = HistorialService.crearRegistro({
                patient: this.currentPatient,
                activeMeds: this.activeMeds,
                notas,
                emisor: this.activeUser,
                fechaEmision: this.emissionDate
            }, reportes);
            reportes.push(registro);
            StorageRepository.saveHistorial(reportes);

            // A partir de aquí el modal queda ligado al registro guardado (evita duplicados)
            this.registroHistorialId = registro.id;
            if (this.btnSaveHistorial) {
                this.btnSaveHistorial.innerHTML = '<span class="btn-icon">💾</span> Actualizar Observaciones';
            }
            this.showToast(`✅ Reporte guardado en el historial con folio #${registro.id}.`, true);
        }

        if (typeof this.onHistorialChanged === 'function') {
            this.onHistorialChanged();
        }
    }

    /**
     * Copia al portapapeles el resumen estructurado para WhatsApp.
     */
    async copyWhatsAppSummary() {
        if (!this.currentPatient) return;

        const customNotes = this.getCustomNotes();

        const textToCopy = generateWhatsAppReportText(
            this.currentPatient, this.activeMeds, customNotes, this.activeUser, this.emissionDate
        );

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

        this.showToast(
            success
                ? '✅ ¡Reporte copiado al portapapeles! Listo para pegar en WhatsApp o notas.'
                : '⚠️ No se pudo copiar automáticamente. Por favor copia el texto manualmente.',
            success
        );
    }

    /**
     * Muestra feedback visual temporal.
     */
    showToast(message, isSuccess) {
        if (!this.toastFeedback) return;

        this.toastFeedback.innerText = message;
        this.toastFeedback.className = isSuccess ? 'copy-toast copy-toast-success' : 'copy-toast copy-toast-warning';
        this.toastFeedback.style.display = 'block';

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            if (this.toastFeedback) {
                this.toastFeedback.style.display = 'none';
            }
        }, 3500);
    }
}
