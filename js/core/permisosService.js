// js/core/permisosService.js
/**
 * Servicio de Control de Acceso Basado en Roles (RBAC) - Capa de Dominio.
 * Centraliza qué acciones puede realizar cada rol hospitalario.
 * Corresponde a la "Matriz de Permisos por Jerarquía" del Diagrama de Casos de Uso con Jerarquía de Actores.
 */

import { ROLES_HOSPITALARIOS } from './authService.js';

const { MEDICO_PEDIATRA, RESIDENTE, ENFERMERO_A, RECEPCION } = ROLES_HOSPITALARIOS;

/** Catálogo de acciones protegidas del sistema. */
export const ACCIONES = {
    CALCULADORA_USAR: 'CALCULADORA_USAR',           // Ver calculadora, registrar peso y ajustar bombas
    PACIENTE_ALTA: 'PACIENTE_ALTA',                 // Registrar nuevo paciente
    PACIENTE_BAJA: 'PACIENTE_BAJA',                 // Eliminar paciente
    REPORTE_GENERAR: 'REPORTE_GENERAR',             // Generar y guardar reporte de entrega de guardia
    HISTORIAL_ELIMINAR: 'HISTORIAL_ELIMINAR',       // Eliminar reportes del historial
    CITA_AGENDAR: 'CITA_AGENDAR',                   // Agendar y editar / reprogramar citas
    CITA_ATENDER: 'CITA_ATENDER',                   // Pasar cita a "En consulta" o "Completada"
    CITA_CANCELAR: 'CITA_CANCELAR',                 // Cancelar o eliminar citas
    USUARIO_GESTIONAR: 'USUARIO_GESTIONAR'          // Editar o dar de baja a otros profesionales
};

/** Matriz de permisos: acción -> roles autorizados. */
export const MATRIZ_PERMISOS = {
    [ACCIONES.CALCULADORA_USAR]: [MEDICO_PEDIATRA, RESIDENTE, ENFERMERO_A],
    [ACCIONES.PACIENTE_ALTA]: [MEDICO_PEDIATRA, RESIDENTE],
    [ACCIONES.PACIENTE_BAJA]: [MEDICO_PEDIATRA],
    [ACCIONES.REPORTE_GENERAR]: [MEDICO_PEDIATRA, RESIDENTE, ENFERMERO_A],
    [ACCIONES.HISTORIAL_ELIMINAR]: [MEDICO_PEDIATRA],
    [ACCIONES.CITA_AGENDAR]: [MEDICO_PEDIATRA, RESIDENTE, RECEPCION],
    [ACCIONES.CITA_ATENDER]: [MEDICO_PEDIATRA, RESIDENTE],
    [ACCIONES.CITA_CANCELAR]: [MEDICO_PEDIATRA, RECEPCION],
    [ACCIONES.USUARIO_GESTIONAR]: [MEDICO_PEDIATRA, RECEPCION]
};

export class PermisosService {
    /**
     * Indica si el usuario puede realizar la acción indicada.
     * @param {Object} usuario - Usuario activo (con propiedad `rol`)
     * @param {string} accion - Una de ACCIONES
     */
    static puede(usuario, accion) {
        if (!usuario || !usuario.rol) return false;
        const roles = MATRIZ_PERMISOS[accion];
        return Array.isArray(roles) && roles.includes(usuario.rol);
    }

    /** Mensaje estándar cuando una acción es denegada. */
    static mensajeDenegado(usuario) {
        const rol = usuario ? (usuario.rolLabel || usuario.rol) : 'tu perfil';
        return `🔒 Acción no permitida para ${rol}. Cambia a un perfil autorizado desde el menú de usuario.`;
    }
}
