// js/ui/authView.js
/**
 * Componente de Vista de Autenticación y Perfiles de Usuario (Capa de Presentación / UI).
 * Genera el marcado para la barra de usuario en cabecera y el modal de cambio de turno/perfil.
 */

/**
 * Genera el HTML para el botón/píldora de usuario activo en la cabecera.
 */
export function renderUserPillHtml(user) {
    if (!user) return '';

    return `
        <button type="button" class="user-pill-btn" id="btn-open-auth-modal" title="Toca para cambiar de profesional o turno">
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
 * Genera el listado de tarjetas de profesionales en el modal de autenticación / perfil.
 */
export function renderProfilesListHtml(usuarios, activeUserId) {
    return usuarios.map(u => {
        const isActive = u.id === activeUserId;

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
                        <span class="info-lbl">Horario Habitual:</span>
                        <span class="info-val">${u.turno}</span>
                    </div>
                </div>

                <div class="profile-card-footer">
                    <button type="button" class="btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'} btn-select-profile" data-user-id="${u.id}">
                        ${isActive ? '✓ Sesión Actual' : 'Iniciar Turno Aquí ➔'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
