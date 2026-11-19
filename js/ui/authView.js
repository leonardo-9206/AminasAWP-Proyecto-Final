// js/ui/authView.js
/**
 * Componente de Vista de Autenticación y Perfiles de Usuario (Capa de Presentación / UI).
 * Genera el marcado para la barra de usuario, lista de perfiles, confirmación de contraseña
 * y formulario de registro de nuevos doctores.
 */

/**
 * Genera el HTML para el botón/píldora de usuario activo en la cabecera.
 */
export function renderUserPillHtml(user) {
    if (!user) return '';

    return `
        <button type="button" class="user-pill-btn" id="btn-open-auth-modal" title="Toca para cambiar de turno o registrar nuevo doctor">
            <span class="user-pill-avatar">${user.avatar || '👤'}</span>
            <div class="user-pill-text">
                <span class="user-pill-name">${user.nombre}</span>
                <span class="user-pill-role">${user.rolLabel || user.rol}</span>
            </div>
            <span class="user-pill-caret">▾</span>
        </button>
    `;
}

/**
 * Genera el listado de tarjetas de profesionales en el modal de autenticación.
 */
export function renderProfilesListHtml(usuarios, activeUserId, puedeGestionar = false) {
    return usuarios.map(u => {
        const isActive = u.id === activeUserId;
        const puedeEditar = puedeGestionar || isActive;
        const puedeEliminar = puedeGestionar && !isActive;
        const demoHint = u.password ? `<small class="auth-demo-hint">🔑 Contraseña: <strong>${u.password}</strong></small>` : '';

        return `
            <div class="profile-card ${isActive ? 'is-active-profile' : ''}" data-user-id="${u.id}">
                <div class="profile-card-header">
                    <span class="profile-avatar">${u.avatar}</span>
                    <div class="profile-details">
                        <h4 class="profile-name">${u.nombre}</h4>
                        <span class="profile-role">${u.rolLabel}</span>
                    </div>
                    ${isActive ? `<span class="badge-active-profile">Turno Activo</span>` : ''}
                </div>

                <div class="profile-card-body">
                    <div class="profile-info-row">
                        <span class="info-lbl">Cédula Profesional:</span>
                        <span class="info-val"><strong>${u.cedula}</strong></span>
                    </div>
                    <div class="profile-info-row">
                        <span class="info-lbl">Especialidad:</span>
                        <span class="info-val">${u.especialidad}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="info-lbl">Turno Habitual:</span>
                        <span class="info-val">${u.turno}</span>
                    </div>
                    <div class="profile-info-row profile-hint-row">
                        ${demoHint}
                    </div>
                </div>

                <div class="profile-card-footer">
                    ${puedeEditar ? `
                        <button type="button" class="btn btn-sm btn-outline-primary btn-edit-profile" data-user-id="${u.id}" title="Editar datos del profesional">
                            ✏️ Editar
                        </button>
                    ` : ''}
                    ${puedeEliminar ? `
                        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-profile" data-user-id="${u.id}" title="Dar de baja al profesional">
                            🗑️
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'} btn-select-profile" data-user-id="${u.id}">
                        ${isActive ? '✓ Sesión Actual' : 'Ingresar Contraseña ➔'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Genera la vista de solicitud de contraseña para iniciar turno con el usuario seleccionado.
 */
export function renderPasswordPromptHtml(targetUser) {
    return `
        <div class="auth-password-prompt">
            <div class="password-user-preview">
                <span class="preview-avatar">${targetUser.avatar}</span>
                <h3 class="preview-name">${targetUser.nombre}</h3>
                <span class="preview-role">${targetUser.rolLabel}</span>
                <span class="preview-cedula">Cédula Profesional: <strong>${targetUser.cedula}</strong></span>
            </div>

            <div id="auth-password-alert" class="alert-box alert-danger" style="display: none;"></div>

            <form id="form-auth-password" class="password-form">
                <div class="form-group">
                    <label for="auth-password-input">Contraseña de Acceso:</label>
                    <input type="password" id="auth-password-input" class="form-control password-input" placeholder="Ingresa tu contraseña" required autofocus autocomplete="current-password">
                </div>

                <div class="password-hint-box">
                    <span>💡 <strong>Nota del Sistema:</strong> Si estás usando una cuenta demo, la contraseña es <code>${targetUser.password || '1234'}</code></span>
                </div>

                <div class="password-form-actions">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-password-prompt">
                        ← Volver a la Lista
                    </button>
                    <button type="submit" class="btn btn-primary" id="btn-submit-password">
                        🔑 Validar e Iniciar Turno
                    </button>
                </div>
            </form>
        </div>
    `;
}
