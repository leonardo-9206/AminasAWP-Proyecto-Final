// js/core/authService.js
/**
 * Servicio de Lógica de Negocio de Autenticación y Perfiles de Usuario (Capa de Dominio).
 * Modela los roles hospitalarios (`MEDICO_PEDIATRA`, `ENFERMERO_A`, `RESIDENTE`) y firma digital.
 */

export const ROLES_HOSPITALARIOS = {
    MEDICO_PEDIATRA: 'MEDICO_PEDIATRA',
    ENFERMERO_A: 'ENFERMERO_A',
    RESIDENTE: 'RESIDENTE'
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
        turno: 'Matutino'
    },
    {
        id: 2,
        nombre: 'Dra. Sofía Herrera',
        cedula: '1123489',
        rol: ROLES_HOSPITALARIOS.MEDICO_PEDIATRA,
        rolLabel: 'Médico Pediatra de Guardia',
        especialidad: 'Urgencias Pediátricas y Choque',
        avatar: '👩‍⚕️',
        turno: 'Vespertino'
    },
    {
        id: 3,
        nombre: 'Enf. Esp. Laura Valenzuela',
        cedula: '7642198',
        rol: ROLES_HOSPITALARIOS.ENFERMERO_A,
        rolLabel: 'Enfermera Especialista UCIP',
        especialidad: 'Infusiones Continuas y Vías Centrales',
        avatar: '👩‍⚕️',
        turno: 'Nocturno A'
    },
    {
        id: 4,
        nombre: 'Dra. Andrea Ruiz',
        cedula: '1459203',
        rol: ROLES_HOSPITALARIOS.RESIDENTE,
        rolLabel: 'Médico Residente de Pediatría',
        especialidad: 'Hospitalización y Piso Pediátrico',
        avatar: '🩺',
        turno: 'Jornada Acumulada'
    }
];

export class AuthService {
    /**
     * Retorna todos los usuarios predefinidos del hospital.
     */
    static getUsuarios() {
        return USUARIOS_PREDEFINIDOS;
    }

    /**
     * Busca un usuario por su ID.
     */
    static getUsuarioPorId(id) {
        const numId = parseInt(id, 10);
        return USUARIOS_PREDEFINIDOS.find(u => u.id === numId) || USUARIOS_PREDEFINIDOS[0];
    }

    /**
     * Formatea la cadena de firma profesional para la ficha médica oficial.
     */
    static formatearFirmaProfesional(usuario) {
        if (!usuario) return 'Firma del Profesional Responsable';
        return `${usuario.nombre} | Céd. ${usuario.cedula} (${usuario.rolLabel})`;
    }
}
