// js/controllers/authController.js
/**
 * Controlador de Autenticación y Perfiles de Usuario (Capa de Aplicación).
 * Gestiona el usuario activo, cambio de turno hospitalario y firma de notas clínicas.
 */

import { AuthService } from '../core/authService.js';
import { StorageRepository } from '../data/storageRepository.js';
import { renderUserPillHtml, renderProfilesListHtml } from '../ui/authView.js';

export class AuthController {
    /**
     * @param {Object} options
     * @param {Function} options.onUserChanged - Callback cuando se cambia el profesional activo
     */
    constructor({ onUserChanged } = {}) {
        this.onUserChanged = onUserChanged || null;

        this.userContainer = document.getElementById('user-header-container');
        this.modalAuth = document.getElementById('modal-auth');
        this.profilesGrid = document.getElementById('profiles-grid');
        this.btnClose = document.getElementById('btn-auth-close');
        this.btnCancel = document.getElementById('btn-auth-cancel');

        this.activeUser = StorageRepository.getActiveUser();
    }

    init() {
        this.renderUserPill();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Abrir modal desde la píldora de usuario
        if (this.userContainer) {
            this.userContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('#btn-open-auth-modal');
                if (btn) {
                    this.open();
                }
            });
        }

        if (this.btnClose) {
            this.btnClose.addEventListener('click', () => this.close());
        }

        if (this.btnCancel) {
            this.btnCancel.addEventListener('click', () => this.close());
        }

        if (this.modalAuth) {
            this.modalAuth.addEventListener('click', (e) => {
                if (e.target === this.modalAuth) {
                    this.close();
                }
            });
        }

        // Selección de perfil dentro del modal
        if (this.profilesGrid) {
            this.profilesGrid.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-select-profile');
                const card = e.target.closest('.profile-card');
                const target = btn || card;

                if (!target) return;

                const userId = parseInt(target.dataset.userId, 10);
                if (!isNaN(userId)) {
                    this.switchUser(userId);
                }
            });
        }

        // Tecla escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    isOpen() {
        return this.modalAuth && this.modalAuth.style.display !== 'none';
    }

    open() {
        this.activeUser = StorageRepository.getActiveUser();

        if (this.profilesGrid) {
            this.profilesGrid.innerHTML = renderProfilesListHtml(
                AuthService.getUsuarios(),
                this.activeUser ? this.activeUser.id : 1
            );
        }

        if (this.modalAuth) {
            this.modalAuth.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }

    close() {
        if (this.modalAuth) {
            this.modalAuth.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    switchUser(userId) {
        const selected = AuthService.getUsuarioPorId(userId);
        if (!selected) return;

        this.activeUser = selected;
        StorageRepository.setActiveUser(selected);

        this.renderUserPill();
        this.close();

        if (typeof this.onUserChanged === 'function') {
            this.onUserChanged(selected);
        }
    }

    renderUserPill() {
        if (!this.userContainer) return;
        this.activeUser = StorageRepository.getActiveUser();
        this.userContainer.innerHTML = renderUserPillHtml(this.activeUser);
    }

    getActiveUser() {
        return this.activeUser || StorageRepository.getActiveUser();
    }
}
