// js/core/historialService.js
/**
 * Servicio de Lógica de Negocio del Historial Clínico (Capa de Dominio).
 * 1. Crea "fotografías" (snapshots) inmutables de reportes de entrega de guardia / bombas.
 * 2. Consolida el historial completo de todos los pacientes consultados (activos, dados de baja y externos)
 *    cruzando sus datos con citas (atendidas, canceladas, programadas) y reportes de infusiones.
 */

export class HistorialService {
    /**
     * Genera un nuevo ID correlativo para reportes.
     */
    static generarSiguienteId(reportes = []) {
        const ids = reportes.map(r => parseInt(r.id, 10)).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    /**
     * Crea el registro de historial de reporte a partir del paciente, sus infusiones activas y el emisor.
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
     * Filtra reportes por texto (paciente, emisor u observaciones) y ordena del más reciente al más antiguo.
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

    /**
     * Registra o actualiza un paciente en el archivo histórico permanente.
     * @param {Array} archivo - Lista actual en aminas_pacientes_historial_data
     * @param {Object} paciente - Objeto paciente de la calculadora
     * @param {string} estado - 'ACTIVO' | 'DADO_DE_BAJA'
     */
    static registrarEnArchivo(archivo = [], paciente, estado = 'ACTIVO') {
        if (!paciente || !paciente.id) return archivo;
        const ahora = new Date().toISOString();
        const copia = Array.isArray(archivo) ? [...archivo] : [];
        const idx = copia.findIndex(p => p.id === paciente.id);

        if (idx >= 0) {
            copia[idx] = {
                ...copia[idx],
                nombre: paciente.name || copia[idx].nombre,
                peso: paciente.peso !== undefined && paciente.peso !== '' ? paciente.peso : copia[idx].peso,
                estado,
                ultimaActualizacion: ahora,
                ...(estado === 'DADO_DE_BAJA' ? { fechaBaja: ahora } : {})
            };
        } else {
            copia.push({
                id: paciente.id,
                nombre: paciente.name || `Paciente ${paciente.id}`,
                peso: paciente.peso || '',
                estado,
                fechaRegistro: ahora,
                ultimaActualizacion: ahora
            });
        }
        return copia;
    }

    /**
     * Consolida el expediente completo de todos los pacientes consultados,
     * combinando pacientes activos, archivo de pacientes dados de baja, citas y reportes de bombas.
     */
    static consolidarPacientes({ pacientesActivos = [], pacientesArchivo = [], citas = [], reportes = [] } = {}) {
        const mapa = new Map();

        const getKey = (id, nombre) => (id ? `id:${id}` : `ext:${String(nombre || 'sin-nombre').trim().toLowerCase()}`);

        // 1. Sembrar desde el archivo histórico
        pacientesArchivo.forEach(p => {
            const key = getKey(p.id, p.nombre);
            mapa.set(key, {
                key,
                id: p.id,
                nombre: p.nombre || `Paciente ${p.id}`,
                peso: p.peso || '',
                estado: p.estado || 'DADO_DE_BAJA',
                fechaRegistro: p.fechaRegistro || p.ultimaActualizacion || null,
                ultimaActividad: p.ultimaActualizacion || p.fechaBaja || p.fechaRegistro || null,
                infusionesActivas: 0,
                citas: [],
                reportes: []
            });
        });

        // 2. Superponer pacientes activos actuales (datos más frescos)
        pacientesActivos.forEach(p => {
            const key = getKey(p.id, p.name);
            const activasCount = Array.isArray(p.meds)
                ? p.meds.filter(m => ((parseFloat(m.dosis) || 0) > 0 || (parseFloat(m.velocidad) || 0) > 0) && m.nombre && m.nombre.trim() !== '').length
                : 0;

            const existente = mapa.get(key);
            if (existente) {
                existente.nombre = p.name || existente.nombre;
                existente.peso = p.peso !== '' && p.peso !== undefined ? p.peso : existente.peso;
                existente.estado = 'ACTIVO';
                existente.infusionesActivas = activasCount;
            } else {
                mapa.set(key, {
                    key,
                    id: p.id,
                    nombre: p.name || `Paciente ${p.id}`,
                    peso: p.peso || '',
                    estado: 'ACTIVO',
                    fechaRegistro: null,
                    ultimaActividad: null,
                    infusionesActivas: activasCount,
                    citas: [],
                    reportes: []
                });
            }
        });

        // 3. Cruzar citas médicas (atendidas, canceladas, programadas, en curso)
        citas.forEach(c => {
            const key = getKey(c.pacienteId, c.pacienteNombre);
            let exp = mapa.get(key);
            if (!exp) {
                exp = {
                    key,
                    id: c.pacienteId || null,
                    nombre: c.pacienteNombre || 'Paciente Externo',
                    peso: '',
                    estado: c.pacienteId ? 'DADO_DE_BAJA' : 'EXTERNO',
                    fechaRegistro: null,
                    ultimaActividad: null,
                    infusionesActivas: 0,
                    citas: [],
                    reportes: []
                };
                mapa.set(key, exp);
            }
            exp.citas.push(c);
            const fechaCitaIso = c.fecha ? `${c.fecha}T${c.hora || '00:00'}:00` : null;
            if (fechaCitaIso && (!exp.ultimaActividad || new Date(fechaCitaIso) > new Date(exp.ultimaActividad))) {
                exp.ultimaActividad = fechaCitaIso;
            }
        });

        // 4. Cruzar reportes de bombas / entrega de guardia
        reportes.forEach(r => {
            const key = getKey(r.pacienteId, r.pacienteNombre);
            let exp = mapa.get(key);
            if (!exp) {
                exp = {
                    key,
                    id: r.pacienteId || null,
                    nombre: r.pacienteNombre || 'Paciente',
                    peso: r.peso || '',
                    estado: 'DADO_DE_BAJA',
                    fechaRegistro: r.fechaEmision,
                    ultimaActividad: r.fechaEmision,
                    infusionesActivas: 0,
                    citas: [],
                    reportes: []
                };
                mapa.set(key, exp);
            } else if (!exp.peso && r.peso) {
                exp.peso = r.peso;
            }
            exp.reportes.push(r);
            if (r.fechaEmision && (!exp.ultimaActividad || new Date(r.fechaEmision) > new Date(exp.ultimaActividad))) {
                exp.ultimaActividad = r.fechaEmision;
            }
        });

        // 5. Ordenar citas y reportes internos y calcular resúmenes
        const lista = Array.from(mapa.values()).map(exp => {
            exp.citas.sort((a, b) => new Date(`${b.fecha}T${b.hora || '00:00'}`) - new Date(`${a.fecha}T${a.hora || '00:00'}`));
            exp.reportes.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
            return {
                ...exp,
                citasCompletadas: exp.citas.filter(c => c.estado === 'COMPLETADA').length,
                citasCanceladas: exp.citas.filter(c => c.estado === 'CANCELADA').length,
                citasActivas: exp.citas.filter(c => c.estado === 'PROGRAMADA' || c.estado === 'EN_CURSO').length
            };
        });

        // Ordenar expedientes: activos primero, luego por última actividad más reciente
        return lista.sort((a, b) => {
            if (a.estado === 'ACTIVO' && b.estado !== 'ACTIVO') return -1;
            if (b.estado === 'ACTIVO' && a.estado !== 'ACTIVO') return 1;
            const tA = a.ultimaActividad ? new Date(a.ultimaActividad).getTime() : 0;
            const tB = b.ultimaActividad ? new Date(b.ultimaActividad).getTime() : 0;
            return tB - tA;
        });
    }

    /**
     * Filtra expedientes de pacientes por nombre, médico, motivo o notas.
     */
    static filtrarPacientes(expedientes = [], busqueda = '') {
        const q = busqueda.trim().toLowerCase();
        if (!q) return expedientes;
        return expedientes.filter(exp => {
            if ((exp.nombre || '').toLowerCase().includes(q)) return true;
            if (exp.citas.some(c =>
                (c.medicoResponsable || '').toLowerCase().includes(q) ||
                (c.motivo || '').toLowerCase().includes(q) ||
                (c.estado || '').toLowerCase().includes(q) ||
                (c.notas || '').toLowerCase().includes(q)
            )) return true;
            if (exp.reportes.some(r =>
                (r.notas || '').toLowerCase().includes(q) ||
                (r.emisor && (r.emisor.nombre || '').toLowerCase().includes(q))
            )) return true;
            return false;
        });
    }
}
