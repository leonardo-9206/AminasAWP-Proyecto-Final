// js/core/agendaService.js
/**
 * Servicio de Lógica de Negocio y Reglas de Agenda de Citas (Capa de Dominio / Core).
 * Gestiona estados clínicos de citas, validaciones de horarios y filtros.
 */

export const ESTADOS_CITA = {
    PROGRAMADA: 'PROGRAMADA',
    EN_CURSO: 'EN_CURSO',
    COMPLETADA: 'COMPLETADA',
    CANCELADA: 'CANCELADA'
};

export const ESTADOS_INFO = {
    PROGRAMADA: {
        label: 'Programada',
        color: '#0284c7',
        bg: '#e0f2fe',
        icon: '📅'
    },
    EN_CURSO: {
        label: 'En Consulta',
        color: '#ea580c',
        bg: '#ffedd5',
        icon: '🩺'
    },
    COMPLETADA: {
        label: 'Completada',
        color: '#16a34a',
        bg: '#dcfce7',
        icon: '✅'
    },
    CANCELADA: {
        label: 'Cancelada',
        color: '#dc2626',
        bg: '#fee2e2',
        icon: '❌'
    }
};

export const MOTIVOS_SUGERIDOS = [
    'Interconsulta de Cardiología Pediátrica (valoración hemodinámica)',
    'Interconsulta de Neurología Pediátrica (sedoanalgesia y estado neurológico)',
    'Control y titulación de aminas vasoactivas en UCIP',
    'Revisión y retiro de vía venosa central',
    'Control pre-alta de Terapia Intensiva (UCIP)',
    'Seguimiento post-egreso UCIP (consulta externa de control)',
    'Seguimiento posquirúrgico cardiovascular'
];

export const MEDICOS_DISPONIBLES = [
    'Dr. Alejandro Morales — Terapia Intensiva Pediátrica (UCIP)',
    'Dra. Sofía Herrera — Cardiología Pediátrica e Interconsultas',
    'Dr. Carlos Méndez — Neurología Pediátrica e Interconsultas',
    'Dra. Andrea Ruiz — Seguimiento Post-UCIP y Hospitalización',
    'Enf. Esp. Laura Valenzuela — Infusiones Continuas y Vías Centrales'
];

export class AgendaService {
    /**
     * Valida que los campos obligatorios de la cita estén presentes.
     */
    static validarCita({ pacienteNombre, medicoResponsable, fecha, hora, motivo }) {
        const errores = [];

        if (!pacienteNombre || pacienteNombre.trim() === '') {
            errores.push('El nombre del paciente es obligatorio.');
        }
        if (!medicoResponsable || medicoResponsable.trim() === '') {
            errores.push('El profesional médico responsable es obligatorio.');
        }
        if (!fecha || fecha.trim() === '') {
            errores.push('La fecha de la cita es obligatoria.');
        }
        if (!hora || hora.trim() === '') {
            errores.push('La hora de la cita es obligatoria.');
        }
        if (!motivo || motivo.trim() === '') {
            errores.push('El motivo de la cita es obligatorio.');
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }

    /**
     * Regla de no empalme: un mismo profesional no puede tener dos citas activas
     * (Programada o En consulta) en la misma fecha y hora.
     * @param {Array} citas - Citas existentes
     * @param {Object} cita - Cita a validar (medicoResponsable, fecha, hora)
     * @param {number|null} excluirId - ID de la cita que se está editando
     * @returns {Object|null} La cita con la que se empalma, o null si el horario está libre
     */
    static buscarEmpalme(citas, { medicoResponsable, fecha, hora }, excluirId = null) {
        if (!Array.isArray(citas)) return null;
        return citas.find(c =>
            c.id !== excluirId &&
            c.medicoResponsable === medicoResponsable &&
            c.fecha === fecha &&
            c.hora === hora &&
            (c.estado === ESTADOS_CITA.PROGRAMADA || c.estado === ESTADOS_CITA.EN_CURSO)
        ) || null;
    }

    /**
     * Genera la lista de profesionales clínicos que pueden recibir interconsultas/citas.
     * Excluye a Recepción y Administrador del Sistema.
     */
    static obtenerMedicosDisponibles(usuarios = []) {
        const lista = (Array.isArray(usuarios) ? usuarios : [])
            .filter(u => u.rol !== 'RECEPCION' && u.rol !== 'ADMIN')
            .map(u => `${u.nombre} — ${u.especialidad}`);
        return lista.length > 0 ? lista : MEDICOS_DISPONIBLES;
    }

    /**
     * Verifica si el usuario con sesión activa es exactamente el médico asignado a la cita.
     * Solo el médico asignado puede marcarla como "En Consulta" o "Completada".
     */
    static esMedicoAsignado(cita, usuario) {
        if (!cita || !usuario) return false;
        if (cita.medicoId && usuario.id) {
            return Number(cita.medicoId) === Number(usuario.id);
        }
        const medicoCita = String(cita.medicoResponsable || '').trim().toLowerCase();
        const nombreUsuario = String(usuario.nombre || '').trim().toLowerCase();
        if (!medicoCita || !nombreUsuario) return false;
        return medicoCita.includes(nombreUsuario);
    }

    /**
     * Genera un nuevo ID numérico correlativo para la cita.
     */
    static generarSiguienteId(citas) {
        if (!Array.isArray(citas) || citas.length === 0) return 1;
        const ids = citas.map(c => parseInt(c.id, 10)).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    /**
     * Filtra citas según el estado y un término de búsqueda (paciente, médico o motivo).
     */
    static filtrarCitas(citas, { estado = 'TODOS', busqueda = '' } = {}) {
        if (!Array.isArray(citas)) return [];

        const searchLower = busqueda.trim().toLowerCase();

        return citas.filter(c => {
            const matchesEstado = (estado === 'TODOS' || !estado) ? true : c.estado === estado;

            const matchesBusqueda = !searchLower ? true : (
                (c.pacienteNombre && c.pacienteNombre.toLowerCase().includes(searchLower)) ||
                (c.medicoResponsable && c.medicoResponsable.toLowerCase().includes(searchLower)) ||
                (c.motivo && c.motivo.toLowerCase().includes(searchLower))
            );

            return matchesEstado && matchesBusqueda;
        }).sort((a, b) => {
            // Ordenar por fecha y hora ascendente
            const dateA = new Date(`${a.fecha}T${a.hora || '00:00'}`);
            const dateB = new Date(`${b.fecha}T${b.hora || '00:00'}`);
            return dateA - dateB;
        });
    }

    /**
     * Retorna la cantidad de citas activas hoy (programadas o en curso).
     */
    static contarCitasHoy(citas) {
        if (!Array.isArray(citas)) return 0;
        const hoy = new Date().toISOString().split('T')[0];
        return citas.filter(c => c.fecha === hoy && (c.estado === ESTADOS_CITA.PROGRAMADA || c.estado === ESTADOS_CITA.EN_CURSO)).length;
    }
}
