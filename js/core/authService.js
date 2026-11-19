// js/core/authService.js
/**
 * Servicio de Lógica de Negocio de Autenticación y Perfiles de Usuario (Capa de Dominio).
 * Modela los roles hospitalarios (`MEDICO_PEDIATRA`, `ENFERMERO_A`, `RESIDENTE`, `RECEPCION`), contraseñas y firma digital.
 */

export const ROLES_HOSPITALARIOS = {
    MEDICO_PEDIATRA: 'MEDICO_PEDIATRA',
    ENFERMERO_A: 'ENFERMERO_A',
    RESIDENTE: 'RESIDENTE',
    RECEPCION: 'RECEPCION'
};

export const ROLES_LABELS = {
    MEDICO_PEDIATRA: 'Médico Pediatra Especialista',
    ENFERMERO_A: 'Enfermero/a Especialista',
    RESIDENTE: 'Médico Residente de Pediatría',
    RECEPCION: 'Administrador / Recepción'
};

/** Avatar por defecto según el rol. */
export const ROLES_AVATAR = {
    MEDICO_PEDIATRA: '👨‍⚕️',
    ENFERMERO_A: '👩‍⚕️',
    RESIDENTE: '🩺',
    RECEPCION: '📋'
};

export const USUARIOS_PREDEFINIDOS = [
    {
        id: 1,
        nombre: 'Dr. Alejandro Morales',
        cedula: '9845210',
        rol: ROLES_HOSPITALARIOS.MEDICO_PEDIATRA,
        rolLabel: 'Médico Pediatra Intensivista',
        especialidad: 'Terapia Intensiva Pediátrica (UCIP)',
        avatar: '👨‍⚕️',
        turno: 'Matutino',
        password: '1234'
    },
    {
        id: 2,
        nombre: 'Dra. Sofía Herrera',
        cedula: '1123489',
        rol: ROLES_HOSPITALARIOS.MEDICO_PEDIATRA,
        rolLabel: 'Médico Pediatra de Guardia',
        especialidad: 'Urgencias Pediátricas y Choque',
        avatar: '👩‍⚕️',
        turno: 'Vespertino',
        password: '1234'
    },
    {
        id: 3,
        nombre: 'Enf. Esp. Laura Valenzuela',
        cedula: '7642198',
        rol: ROLES_HOSPITALARIOS.ENFERMERO_A,
        rolLabel: 'Enfermera Especialista UCIP',
        especialidad: 'Infusiones Continuas y Vías Centrales',
        avatar: '👩‍⚕️',
        turno: 'Nocturno A',
        password: '1234'
    },
    {
        id: 4,
        nombre: 'Dra. Andrea Ruiz',
        cedula: '1459203',
        rol: ROLES_HOSPITALARIOS.RESIDENTE,
        rolLabel: 'Médico Residente de Pediatría',
        especialidad: 'Hospitalización y Piso Pediátrico',
        avatar: '🩺',
        turno: 'Jornada Acumulada',
        password: '1234'
    },
    {
        id: 5,
        nombre: 'Lic. Mariana Torres',
        cedula: '5521874',
        rol: ROLES_HOSPITALARIOS.RECEPCION,
        rolLabel: 'Administrador / Recepción',
        especialidad: 'Control de Agenda y Admisión Pediátrica',
        avatar: '📋',
        turno: 'Matutino',
        password: '1234'
    }
];

export class AuthService {
    /**
     * Retorna todos los usuarios predefinidos del hospital.
     */
    static getUsuariosPredefinidos() {
        return USUARIOS_PREDEFINIDOS;
    }

    /**
     * Valida si la contraseña ingresada coincide con la del usuario.
     */
    static validarPassword(usuario, passwordInput) {
        if (!usuario || typeof passwordInput !== 'string') return false;
        const passEsperada = String(usuario.password || '1234').trim();
        return passEsperada === passwordInput.trim();
    }

    /**
     * Valida los datos para dar de alta (o modificar) un profesional de la salud.
     * @param {Object} data - Datos capturados en el formulario
     * @param {Array} usuariosExistentes - Catálogo actual de usuarios
     * @param {Object} opciones
     * @param {number|null} opciones.excluirId - ID del usuario que se está editando (no cuenta como duplicado)
     * @param {boolean} opciones.passwordOpcional - En edición, la contraseña vacía significa "conservar la actual"
     */
    static validarNuevoUsuario(data, usuariosExistentes = [], { excluirId = null, passwordOpcional = false } = {}) {
        const errores = [];

        if (!data.nombre || data.nombre.trim().length < 3) {
            errores.push('El nombre completo es obligatorio (mínimo 3 caracteres).');
        }

        if (!data.cedula || data.cedula.trim().length < 4) {
            errores.push('La cédula profesional es obligatoria (mínimo 4 dígitos).');
        } else {
            const cleanCedula = data.cedula.trim();
            const cedulaDuplicada = usuariosExistentes.some(u =>
                u.id !== excluirId && String(u.cedula).trim() === cleanCedula
            );
            if (cedulaDuplicada) {
                errores.push(`Ya existe un profesional registrado con la cédula ${cleanCedula}.`);
            }
        }

        if (!data.rol || !ROLES_HOSPITALARIOS[data.rol]) {
            errores.push('Debes seleccionar un rol hospitalario válido.');
        }

        if (!data.especialidad || data.especialidad.trim().length < 3) {
            errores.push('La especialidad o área de servicio es obligatoria.');
        }

        const cambiaPassword = !passwordOpcional || (data.password && data.password.length > 0);

        if (cambiaPassword && (!data.password || data.password.trim().length < 3)) {
            errores.push('La contraseña debe tener al menos 3 caracteres.');
        }

        if (cambiaPassword && data.password !== data.confirmPassword) {
            errores.push('Las contraseñas ingresadas no coinciden.');
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }

    /**
     * Genera la entidad de nuevo usuario.
     */
    static crearUsuario(data, usuariosExistentes = []) {
        const ids = usuariosExistentes.map(u => parseInt(u.id, 10)).filter(id => !isNaN(id));
        const nuevoId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

        const avatar = ROLES_AVATAR[data.rol] || '👨‍⚕️';
        const rolLabel = ROLES_LABELS[data.rol] || 'Personal de Salud';

        return {
            id: nuevoId,
            nombre: data.nombre.trim(),
            cedula: data.cedula.trim(),
            rol: data.rol,
            rolLabel: rolLabel,
            especialidad: data.especialidad.trim(),
            avatar: avatar,
            turno: data.turno ? data.turno.trim() : 'Rotatorio',
            password: data.password.trim(),
            fechaRegistro: new Date().toISOString()
        };
    }

    /**
     * Aplica los cambios capturados a un usuario existente (operación de "Cambio" del catálogo).
     * Si la contraseña viene vacía se conserva la anterior.
     */
    static actualizarUsuario(usuario, data) {
        const rolCambio = usuario.rol !== data.rol;
        return {
            ...usuario,
            nombre: data.nombre.trim(),
            cedula: data.cedula.trim(),
            rol: data.rol,
            rolLabel: rolCambio ? (ROLES_LABELS[data.rol] || usuario.rolLabel) : usuario.rolLabel,
            avatar: rolCambio ? (ROLES_AVATAR[data.rol] || usuario.avatar) : usuario.avatar,
            especialidad: data.especialidad.trim(),
            turno: data.turno ? data.turno.trim() : usuario.turno,
            password: data.password && data.password.length > 0 ? data.password.trim() : usuario.password,
            fechaModificacion: new Date().toISOString()
        };
    }

    /**
     * Valida si un usuario puede darse de baja (operación de "Baja" del catálogo).
     * Reglas: no se puede eliminar el usuario con sesión activa ni dejar el sistema sin un Médico Pediatra.
     */
    static validarBajaUsuario(usuarioId, usuarios = [], activeUserId = null) {
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!usuario) {
            return { valido: false, error: 'El profesional no existe.' };
        }
        if (usuarioId === activeUserId) {
            return { valido: false, error: 'No puedes eliminar el perfil con el turno activo. Cambia de perfil primero.' };
        }
        if (usuario.rol === ROLES_HOSPITALARIOS.MEDICO_PEDIATRA) {
            const medicosRestantes = usuarios.filter(u => u.rol === ROLES_HOSPITALARIOS.MEDICO_PEDIATRA && u.id !== usuarioId);
            if (medicosRestantes.length === 0) {
                return { valido: false, error: 'Debe existir al menos un Médico Pediatra registrado en el sistema.' };
            }
        }
        return { valido: true, error: null };
    }

    /**
     * Formatea la cadena de firma profesional para la ficha médica oficial.
     */
    static formatearFirmaProfesional(usuario) {
        if (!usuario) return 'Firma del Profesional Responsable';
        return `${usuario.nombre} | Céd. ${usuario.cedula} (${usuario.rolLabel})`;
    }
}
