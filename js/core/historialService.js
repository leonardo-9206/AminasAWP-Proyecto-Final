// js/core/historialService.js
/**
 * Servicio de Lógica de Negocio del Historial de Reportes de Entrega de Guardia (Capa de Dominio).
 * Crea "fotografías" (snapshots) inmutables del estado del paciente al momento de la entrega de turno,
 * para que el reporte no cambie aunque después se modifiquen las bombas en la calculadora.
 */

export class HistorialService {
    /**
     * Genera un nuevo ID correlativo.
     */
    static generarSiguienteId(reportes = []) {
        const ids = reportes.map(r => parseInt(r.id, 10)).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    /**
     * Crea el registro de historial a partir del paciente, sus infusiones activas y el emisor.
     */
    static crearRegistro({ patient, activeMeds, notas = '', emisor = null, fechaEmision = new Date() }, reportes = []) {
        return {
            id: this.generarSiguienteId(reportes),
            pacienteId: patient.id,
            pacienteNombre: patient.name || `Paciente ${patient.id}`,
            peso: patient.peso,
            infusiones: JSON.parse(JSON.stringify(activeMeds || [])),
            notas: (notas || '').trim(),
            emisor: emisor ? {
                id: emisor.id,
                nombre: emisor.nombre,
                cedula: emisor.cedula,
                rolLabel: emisor.rolLabel
            } : null,
            fechaEmision: fechaEmision.toISOString()
        };
    }

    /**
     * Convierte un registro del historial al formato de "paciente" que usa la vista del reporte.
     */
    static aPaciente(registro) {
        return {
            id: registro.pacienteId,
            name: registro.pacienteNombre,
            peso: registro.peso,
            meds: registro.infusiones || []
        };
    }

    /**
     * Filtra por texto (paciente, emisor u observaciones) y ordena del más reciente al más antiguo.
     */
    static filtrar(reportes = [], busqueda = '') {
        const q = busqueda.trim().toLowerCase();
        return reportes
            .filter(r => !q ||
                (r.pacienteNombre || '').toLowerCase().includes(q) ||
                (r.emisor && (r.emisor.nombre || '').toLowerCase().includes(q)) ||
                (r.notas || '').toLowerCase().includes(q))
            .sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
    }
}
