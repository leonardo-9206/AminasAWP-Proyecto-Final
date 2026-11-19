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
    'Control y titulación de aminas vasoactivas',
    'Ajuste de dosis y velocidad de infusión',
    'Valoración hemodinámica general',
    'Revisión y retiro de vía venosa central',
    'Control pre-alta de Terapia Intensiva (UCIP)',
    'Seguimiento posquirúrgico cardiovascular',
    'Monitoreo de sedoanalgesia y destete ventilatorio'
];

export const MEDICOS_DISPONIBLES = [
    'Dr. Alejandro Morales (Pediatra General)',
    'Dra. Sofía Herrera (Médico Intensivista UCIP)',
    'Dr. Carlos Méndez (Cardiólogo Pediátrico)',
    'Enf. Esp. Laura Valenzuela (Enfermera de Terapia)'
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
