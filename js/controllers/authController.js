// js/controllers/authController.js
/**
 * Controlador de Autenticación, Registro de Doctores y Perfiles Hospitalarios (Capa de Aplicación).
 * Gestiona el control de acceso, verificación de contraseñas por turno y alta de nuevos profesionales.
 */

import { AuthService } from '../core/authService.js';
import { PermisosService, ACCIONES } from '../core/permisosService.js';
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
        this.registerLead = document.getElementById('auth-register-lead');
        this.btnSubmitDoctor = document.getElementById('btn-submit-new-doctor');
        this.btnCancelEditDoctor = document.getElementById('btn-cancel-edit-doctor');

        this.usuarios = [];
        this.activeUser = null;
        this.pendingUser = null;
        this.editingUserId = null; // null = alta de profesional; número = edición
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
                if (!PermisosService.puede(this.activeUser, ACCIONES.USUARIO_GESTIONAR)) {
                    alert(PermisosService.mensajeDenegado(this.activeUser));
                    return;
                }
                this.showView('register');
            });
        }

        // Selección de tarjeta de perfil para cambiar de turno
        if (this.profilesGrid) {
            this.profilesGrid.addEventListener('click', (e) => {
                const btnEdit = e.target.closest('.btn-edit-profile');
                if (btnEdit) {
                    this.handleEditProfile(parseInt(btnEdit.dataset.userId, 10));
                    return;
                }

                const btnDelete = e.target.closest('.btn-delete-profile');
                if (btnDelete) {
                    this.handleDeleteProfile(parseInt(btnDelete.dataset.userId, 10));
                    return;
                }

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
                if (this.editingUserId !== null) {
                    this.handleUpdateDoctor();
                } else {
                    this.handleRegisterDoctor();
                }
            });
        }

        if (this.btnCancelEditDoctor) {
            this.btnCancelEditDoctor.addEventListener('click', () => this.showView('list'));
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

        // Cualquier cambio de vista sale del modo edición (openEditForm lo vuelve a activar)
        this.editingUserId = null;
        this.updateRegisterFormMode(null);

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
        const puedeGestionar = PermisosService.puede(this.activeUser, ACCIONES.USUARIO_GESTIONAR);
        if (this.tabRegisterBtn) {
            this.tabRegisterBtn.style.display = puedeGestionar ? '' : 'none';
        }
        this.profilesGrid.innerHTML = renderProfilesListHtml(this.usuarios, this.activeUser ? this.activeUser.id : 1, puedeGestionar);
    }

    // ------------------------------------------------------------------
    // Cambios y Bajas del catálogo de Usuarios
    // ------------------------------------------------------------------

    /** Ajusta textos del formulario según alta o edición. */
    updateRegisterFormMode(usuario) {
        const editando = !!usuario;
        if (this.registerLead) {
            this.registerLead.innerText = editando
                ? `Modifica los datos de ${usuario.nombre}. Deja la contraseña vacía para conservar la actual.`
                : 'Ingresa los datos profesionales y credenciales para dar de alta un nuevo médico, especialista o enfermero/a en el sistema.';
        }
        if (this.btnSubmitDoctor) {
            this.btnSubmitDoctor.innerHTML = editando ? '💾 Guardar Cambios' : '💾 Registrar e Iniciar Turno';
        }
        if (this.btnCancelEditDoctor) {
            this.btnCancelEditDoctor.style.display = editando ? 'inline-flex' : 'none';
        }
        if (this.tabRegisterBtn) {
            this.tabRegisterBtn.innerHTML = editando ? '✏️ Editar Profesional' : '➕ Registrar Nuevo Doctor/a';
        }
        const passInput = document.getElementById('reg-doc-password');
        const confirmInput = document.getElementById('reg-doc-confirm-password');
        [passInput, confirmInput].forEach(input => {
            if (!input) return;
            input.required = !editando;
            input.placeholder = editando ? 'Vacío = conservar contraseña actual' : (input === passInput ? 'Mínimo 3 caracteres' : 'Repite la contraseña');
        });
        const rolSelect = document.getElementById('reg-doc-rol');
        if (rolSelect) {
            // Un profesional sin permiso de gestión no puede cambiarse el rol a sí mismo
            rolSelect.disabled = editando && !PermisosService.puede(this.activeUser, ACCIONES.USUARIO_GESTIONAR);
        }
    }

    handleEditProfile(userId) {
        const usuario = this.usuarios.find(u => u.id === userId);
        if (!usuario) return;

        const esPropio = this.activeUser && this.activeUser.id === userId;
        if (!esPropio && !PermisosService.puede(this.activeUser, ACCIONES.USUARIO_GESTIONAR)) {
            alert(PermisosService.mensajeDenegado(this.activeUser));
            return;
        }

        this.showView('register');
        this.editingUserId = userId;
        this.updateRegisterFormMode(usuario);

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };
        setVal('reg-doc-nombre', usuario.nombre);
        setVal('reg-doc-cedula', usuario.cedula);
        setVal('reg-doc-rol', usuario.rol);
        setVal('reg-doc-especialidad', usuario.especialidad);
        setVal('reg-doc-turno', usuario.turno);
        setVal('reg-doc-password', '');
        setVal('reg-doc-confirm-password', '');
    }

    handleUpdateDoctor() {
        const usuario = this.usuarios.find(u => u.id === this.editingUserId);
        if (!usuario) return;

        const formData = this.leerFormularioDoctor();
        const validacion = AuthService.validarNuevoUsuario(formData, this.usuarios, {
            excluirId: usuario.id,
            passwordOpcional: true
        });
        if (!validacion.valido) {
            this.showRegisterAlert(validacion.errores.join(' '));
            return;
        }

        const actualizado = AuthService.actualizarUsuario(usuario, formData);
        this.usuarios = this.usuarios.map(u => (u.id === actualizado.id ? actualizado : u));
        StorageRepository.saveUsuarios(this.usuarios);

        // Si se editó el perfil con turno activo, se refresca la sesión
        if (this.activeUser && this.activeUser.id === actualizado.id) {
            this.switchActiveUser(actualizado);
        } else if (typeof this.onUserChanged === 'function') {
            this.onUserChanged(this.activeUser);
        }

        this.showView('list');
    }

    handleDeleteProfile(userId) {
        if (!PermisosService.puede(this.activeUser, ACCIONES.USUARIO_GESTIONAR)) {
            alert(PermisosService.mensajeDenegado(this.activeUser));
            return;
        }

        const validacion = AuthService.validarBajaUsuario(userId, this.usuarios, this.activeUser ? this.activeUser.id : null);
        if (!validacion.valido) {
            alert(`⚠️ ${validacion.error}`);
            return;
        }

        const usuario = this.usuarios.find(u => u.id === userId);
        if (!confirm(`¿Dar de baja a ${usuario.nombre}? Ya no podrá iniciar turno en el sistema.`)) return;

        this.usuarios = this.usuarios.filter(u => u.id !== userId);
        StorageRepository.saveUsuarios(this.usuarios);
        if (typeof this.onUserChanged === 'function') {
            this.onUserChanged(this.activeUser);
        }
        this.renderProfilesList();
    }

    leerFormularioDoctor() {
        const val = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        return {
            nombre: val('reg-doc-nombre').trim(),
            cedula: val('reg-doc-cedula').trim(),
            rol: val('reg-doc-rol'),
            especialidad: val('reg-doc-especialidad').trim(),
            turno: val('reg-doc-turno') || 'Matutino',
            password: val('reg-doc-password'),
            confirmPassword: val('reg-doc-confirm-password')
        };
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
        if (!PermisosService.puede(this.activeUser, ACCIONES.USUARIO_GESTIONAR)) {
            this.showRegisterAlert(PermisosService.mensajeDenegado(this.activeUser));
            return;
        }
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
