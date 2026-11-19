// js/core/authService.js
/**
 * Servicio de Lógica de Negocio de Autenticación y Perfiles de Usuario (Capa de Dominio).
 * Modela los roles hospitalarios (`MEDICO_PEDIATRA`, `ENFERMERO_A`, `RESIDENTE`), contraseñas y firma digital.
 */

export const ROLES_HOSPITALARIOS = {
    MEDICO_PEDIATRA: 'MEDICO_PEDIATRA',
    ENFERMERO_A: 'ENFERMERO_A',
    RESIDENTE: 'RESIDENTE'
};

export const ROLES_LABELS = {
    MEDICO_PEDIATRA: 'Médico Pediatra Especialista',
    ENFERMERO_A: 'Enfermero/a Especialista',
    RESIDENTE: 'Médico Residente de Pediatría'
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
     * Valida los datos para dar de alta un nuevo doctor o profesional de la salud.
     */
    static validarNuevoUsuario(data, usuariosExistentes = []) {
        const errores = [];

        if (!data.nombre || data.nombre.trim().length < 3) {
            errores.push('El nombre completo es obligatorio (mínimo 3 caracteres).');
        }

        if (!data.cedula || data.cedula.trim().length < 4) {
            errores.push('La cédula profesional es obligatoria (mínimo 4 dígitos).');
        } else {
            const cleanCedula = data.cedula.trim();
            const cedulaDuplicada = usuariosExistentes.some(u => String(u.cedula).trim() === cleanCedula);
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

        if (!data.password || data.password.trim().length < 3) {
            errores.push('La contraseña debe tener al menos 3 caracteres.');
        }

        if (data.password !== data.confirmPassword) {
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

        let avatar = '👨‍⚕️';
        if (data.rol === ROLES_HOSPITALARIOS.ENFERMERO_A) {
            avatar = '👩‍⚕️';
        } else if (data.rol === ROLES_HOSPITALARIOS.RESIDENTE) {
            avatar = '🩺';
        }

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
     * Formatea la cadena de firma profesional para la ficha médica oficial.
     */
    static formatearFirmaProfesional(usuario) {
        if (!usuario) return 'Firma del Profesional Responsable';
        return `${usuario.nombre} | Céd. ${usuario.cedula} (${usuario.rolLabel})`;
    }
}
