// js/controllers/authController.js
/**
 * Controlador de Autenticación, Registro de Doctores y Perfiles Hospitalarios (Capa de Aplicación).
 * Gestiona el control de acceso, verificación de contraseñas por turno y alta de nuevos profesionales.
 */

import { AuthService } from '../core/authService.js';
import { StorageRepository } from '../data/storageRepository.js';
import { renderUserPillHtml, renderProfilesListHtml, renderPasswordPromptHtml } from '../ui/authView.js';

export class AuthController {
    /**
     * @param {Object} options
     * @param {Function} options.onUserChanged - Callback cuando se cambia el profesional activo
     */
    constructor({ onUserChanged } = {}) {
        this.onUserChanged = onUserChanged || null;

        // Contenedor principal de la píldora en cabecera
        this.userContainer = document.getElementById('user-header-container');

        // Elementos del Modal de Autenticación
        this.modalAuth = document.getElementById('modal-auth');
        this.btnClose = document.getElementById('btn-auth-close');
        this.btnCancel = document.getElementById('btn-auth-cancel');

        // Pestañas / Secciones del Modal
        this.tabProfilesBtn = document.getElementById('auth-tab-profiles');
        this.tabRegisterBtn = document.getElementById('auth-tab-register');
        this.profilesSection = document.getElementById('auth-profiles-section');
        this.registerSection = document.getElementById('auth-register-section');
        this.passwordSection = document.getElementById('auth-password-section');
        this.profilesGrid = document.getElementById('profiles-grid');

        // Formulario de Registro de Nuevo Doctor
        this.registerForm = document.getElementById('form-register-doctor');
        this.registerAlert = document.getElementById('auth-register-alert');

        this.usuarios = [];
        this.activeUser = null;
        this.pendingUser = null;
        this.currentView = 'list'; // 'list', 'register', 'password'
    }

    init() {
        this.usuarios = StorageRepository.loadUsuarios(AuthService.getUsuariosPredefinidos());
        this.activeUser = StorageRepository.getActiveUser() || this.usuarios[0];

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

        // Botones de cierre
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

        // Pestañas de navegación dentro del modal
        if (this.tabProfilesBtn) {
            this.tabProfilesBtn.addEventListener('click', () => {
                this.showView('list');
            });
        }

        if (this.tabRegisterBtn) {
            this.tabRegisterBtn.addEventListener('click', () => {
                this.showView('register');
            });
        }

        // Selección de tarjeta de perfil para cambiar de turno
        if (this.profilesGrid) {
            this.profilesGrid.addEventListener('click', (e) => {
                const target = e.target.closest('.btn-select-profile') || e.target.closest('.profile-card');
                if (!target) return;

                const userId = parseInt(target.dataset.userId, 10);
                if (!isNaN(userId)) {
                    this.handleSelectProfile(userId);
                }
            });
        }

        // Formulario de Registro de Nuevo Doctor
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegisterDoctor();
            });
        }

        // Formulario y eventos de Contraseña
        if (this.passwordSection) {
            this.passwordSection.addEventListener('submit', (e) => {
                if (e.target.id === 'form-auth-password') {
                    e.preventDefault();
                    this.handleVerifyPassword();
                }
            });

            this.passwordSection.addEventListener('click', (e) => {
                if (e.target.id === 'btn-cancel-password-prompt' || e.target.closest('#btn-cancel-password-prompt')) {
                    this.showView('list');
                }
            });
        }

        // Tecla escape para cerrar
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
        this.usuarios = StorageRepository.loadUsuarios(AuthService.getUsuariosPredefinidos());
        this.activeUser = StorageRepository.getActiveUser() || this.usuarios[0];

        this.showView('list');

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
        this.pendingUser = null;
    }

    showView(viewName) {
        this.currentView = viewName;

        if (this.profilesSection) this.profilesSection.style.display = 'none';
        if (this.registerSection) this.registerSection.style.display = 'none';
        if (this.passwordSection) this.passwordSection.style.display = 'none';

        if (this.tabProfilesBtn) this.tabProfilesBtn.classList.remove('active');
        if (this.tabRegisterBtn) this.tabRegisterBtn.classList.remove('active');

        if (viewName === 'register') {
            if (this.registerSection) this.registerSection.style.display = 'block';
            if (this.tabRegisterBtn) this.tabRegisterBtn.classList.add('active');
            if (this.registerForm) this.registerForm.reset();
            this.hideRegisterAlert();
        } else if (viewName === 'password') {
            if (this.passwordSection) this.passwordSection.style.display = 'block';
            const passInput = document.getElementById('auth-password-input');
            if (passInput) passInput.focus();
        } else {
            // 'list'
            if (this.profilesSection) this.profilesSection.style.display = 'block';
            if (this.tabProfilesBtn) this.tabProfilesBtn.classList.add('active');
            this.renderProfilesList();
        }
    }

    renderProfilesList() {
        if (!this.profilesGrid) return;
        this.usuarios = StorageRepository.loadUsuarios(AuthService.getUsuariosPredefinidos());
        this.profilesGrid.innerHTML = renderProfilesListHtml(this.usuarios, this.activeUser ? this.activeUser.id : 1);
    }

    handleSelectProfile(userId) {
        const target = this.usuarios.find(u => u.id === userId);
        if (!target) return;

        // Si ya es el usuario activo, solo cerramos
        if (this.activeUser && this.activeUser.id === target.id) {
            this.close();
            return;
        }

        // Solicitar contraseña del usuario seleccionado
        this.pendingUser = target;
        if (this.passwordSection) {
            this.passwordSection.innerHTML = renderPasswordPromptHtml(target);
        }
        this.showView('password');
    }

    handleVerifyPassword() {
        if (!this.pendingUser) return;

        const passInput = document.getElementById('auth-password-input');
        const alertEl = document.getElementById('auth-password-alert');
        const passVal = passInput ? passInput.value : '';

        const esValido = AuthService.validarPassword(this.pendingUser, passVal);

        if (!esValido) {
            if (alertEl) {
                alertEl.innerText = '❌ Contraseña incorrecta. Por favor verifica e intenta nuevamente.';
                alertEl.style.display = 'block';
            }
            if (passInput) {
                passInput.select();
                passInput.focus();
            }
            return;
        }

        // Contraseña correcta: Cambiar de usuario
        this.switchActiveUser(this.pendingUser);
        this.close();
    }

    handleRegisterDoctor() {
        const nombreInput = document.getElementById('reg-doc-nombre');
        const cedulaInput = document.getElementById('reg-doc-cedula');
        const rolSelect = document.getElementById('reg-doc-rol');
        const espInput = document.getElementById('reg-doc-especialidad');
        const turnoSelect = document.getElementById('reg-doc-turno');
        const passInput = document.getElementById('reg-doc-password');
        const confirmPassInput = document.getElementById('reg-doc-confirm-password');

        const formData = {
            nombre: nombreInput ? nombreInput.value.trim() : '',
            cedula: cedulaInput ? cedulaInput.value.trim() : '',
            rol: rolSelect ? rolSelect.value : '',
            especialidad: espInput ? espInput.value.trim() : '',
            turno: turnoSelect ? turnoSelect.value : 'Matutino',
            password: passInput ? passInput.value : '',
            confirmPassword: confirmPassInput ? confirmPassInput.value : ''
        };

        const validacion = AuthService.validarNuevoUsuario(formData, this.usuarios);
        if (!validacion.valido) {
            this.showRegisterAlert(validacion.errores.join(' '));
            return;
        }

        this.hideRegisterAlert();

        const nuevoDoctor = AuthService.crearUsuario(formData, this.usuarios);

        // Guardar nuevo doctor en el catálogo de usuarios
        this.usuarios.push(nuevoDoctor);
        StorageRepository.saveUsuarios(this.usuarios);

        // Iniciar sesión directamente con el nuevo doctor registrado
        this.switchActiveUser(nuevoDoctor);

        alert(`✅ ¡Doctor/a registrado exitosamente!\n\nBienvenido/a, ${nuevoDoctor.nombre}.\nTu turno ha sido iniciado.`);
        this.close();
    }

    switchActiveUser(user) {
        this.activeUser = user;
        StorageRepository.setActiveUser(user);

        this.renderUserPill();

        if (typeof this.onUserChanged === 'function') {
            this.onUserChanged(user);
        }
    }

    renderUserPill() {
        if (!this.userContainer) return;
        this.activeUser = StorageRepository.getActiveUser() || this.usuarios[0];
        this.userContainer.innerHTML = renderUserPillHtml(this.activeUser);
    }

    showRegisterAlert(msg) {
        if (!this.registerAlert) return;
        this.registerAlert.innerText = `⚠️ ${msg}`;
        this.registerAlert.style.display = 'block';
    }

    hideRegisterAlert() {
        if (!this.registerAlert) return;
        this.registerAlert.innerText = '';
        this.registerAlert.style.display = 'none';
    }

    getActiveUser() {
        return this.activeUser || StorageRepository.getActiveUser();
    }
}
