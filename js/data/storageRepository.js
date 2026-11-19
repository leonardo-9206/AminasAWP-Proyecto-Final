// js/data/storageRepository.js
/**
 * Capa de Persistencia y Acceso a Datos (Data Access Layer - Patrón Repositorio).
 * Permite desacoplar el almacenamiento de la interfaz y la lógica de negocio.
 * Actualmente gestiona LocalStorage; extensible a IndexedDB o backend API sin alterar las capas superiores.
 */

export const STORAGE_KEYS = {
    PWA_DATA: 'aminas_pwa_data',
    CITAS_DATA: 'aminas_citas_data',
    AUTH_DATA: 'aminas_auth_data',
    USUARIOS_DATA: 'aminas_usuarios_data',
    HISTORIAL_DATA: 'aminas_historial_data'
};

export class StorageRepository {
    /**
     * Carga el estado general de la calculadora (pacientes, bombas e infusiones).
     * @param {Array} defaultMeds - Plantilla de medicamentos por defecto si no hay datos.
     * @returns {Object} appState
     */
    static loadAppState(defaultMeds) {
        const defaultState = {
            activePatientId: 1,
            nextPatientId: 2,
            patients: [
                {
                    id: 1,
                    name: 'Paciente 1',
                    peso: '',
                    meds: JSON.parse(JSON.stringify(defaultMeds))
                }
            ]
        };

        const saved = localStorage.getItem(STORAGE_KEYS.PWA_DATA);
        if (!saved) return defaultState;

        try {
            const parsed = JSON.parse(saved);
            if (!parsed.nextPatientId || isNaN(parsed.nextPatientId)) {
                parsed.nextPatientId = parsed.patients && parsed.patients.length > 0
                    ? Math.max(...parsed.patients.map(p => p.id)) + 1
                    : 2;
            }

            // Normalización defensiva de datos heredados
            if (Array.isArray(parsed.patients)) {
                parsed.patients.forEach(p => {
                    if (Array.isArray(p.meds)) {
                        p.meds.forEach(med => {
                            if (typeof med.velocidad2 === 'undefined') {
                                med.velocidad2 = 2;
                                med.equiv_unidad2 = med.equiv_unidad || 'mcg/kg/min';
                            }
                        });
                    }
                });
            }

            return parsed;
        } catch (e) {
            console.error('[StorageRepository] Error al deserializar datos de pacientes:', e);
            return defaultState;
        }
    }

    /**
     * Guarda el estado general de la calculadora.
     * @param {Object} appState
     */
    static saveAppState(appState) {
        try {
            localStorage.setItem(STORAGE_KEYS.PWA_DATA, JSON.stringify(appState));
            return true;
        } catch (e) {
            console.error('[StorageRepository] Error al guardar datos en LocalStorage:', e);
            return false;
        }
    }

    /**
     * Carga la lista de citas programadas.
     * Si no hay citas previas, inicializa con citas de ejemplo para demostración clínica.
     * @returns {Array} citas
     */
    static loadCitas() {
        const saved = localStorage.getItem(STORAGE_KEYS.CITAS_DATA);
        if (!saved) {
            const hoy = new Date().toISOString().split('T')[0];
            const defaultCitas = [
                {
                    id: 1,
                    pacienteId: 1,
                    pacienteNombre: 'Paciente 1',
                    medicoResponsable: 'Dr. Alejandro Morales — Terapia Intensiva Pediátrica (UCIP)',
                    fecha: hoy,
                    hora: '10:00',
                    motivo: 'Control y titulación de aminas vasoactivas',
                    estado: 'PROGRAMADA',
                    notas: 'Evaluar descenso gradual de Dopamina según presión arterial media.'
                },
                {
                    id: 2,
                    pacienteId: 1,
                    pacienteNombre: 'Paciente 1',
                    medicoResponsable: 'Dra. Sofía Herrera — Urgencias Pediátricas y Choque',
                    fecha: hoy,
                    hora: '14:30',
                    motivo: 'Valoración hemodinámica y retiro de vía venosa central',
                    estado: 'PROGRAMADA',
                    notas: 'Verificar tiempos de coagulación y plaquetas previos.'
                }
            ];
            this.saveCitas(defaultCitas);
            return defaultCitas;
        }
        try {
            return JSON.parse(saved) || [];
        } catch (e) {
            console.error('[StorageRepository] Error al cargar citas:', e);
            return [];
        }
    }

    /**
     * Guarda la lista de citas.
     * @param {Array} citas
     */
    static saveCitas(citas) {
        try {
            localStorage.setItem(STORAGE_KEYS.CITAS_DATA, JSON.stringify(citas));
            return true;
        } catch (e) {
            console.error('[StorageRepository] Error al guardar citas:', e);
            return false;
        }
    }

    /**
     * Obtiene el usuario/sesión activa.
     */
    static getActiveUser() {
        const saved = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
        if (!saved) {
            const defaultUser = {
                id: 1,
                nombre: 'Dr. Alejandro Morales',
                cedula: '9845210',
                rol: 'MEDICO_PEDIATRA',
                rolLabel: 'Médico Pediatra Intensivista',
                especialidad: 'Terapia Intensiva Pediátrica (UCIP)',
                avatar: '👨‍⚕️',
                turno: 'Matutino'
            };
            this.setActiveUser(defaultUser);
            return defaultUser;
        }
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }

    /**
     * Guarda el usuario/sesión activa.
     */
    static setActiveUser(user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(user));
    }

    /**
     * Carga el historial de reportes de entrega de guardia guardados.
     * @returns {Array} reportes
     */
    static loadHistorial() {
        const saved = localStorage.getItem(STORAGE_KEYS.HISTORIAL_DATA);
        if (!saved) return [];
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('[StorageRepository] Error al cargar historial de reportes:', e);
            return [];
        }
    }

    /**
     * Guarda el historial de reportes de entrega de guardia.
     * @param {Array} reportes
     */
    static saveHistorial(reportes) {
        try {
            localStorage.setItem(STORAGE_KEYS.HISTORIAL_DATA, JSON.stringify(reportes));
            return true;
        } catch (e) {
            console.error('[StorageRepository] Error al guardar historial de reportes:', e);
            return false;
        }
    }

    /**
     * Carga la lista de usuarios/profesionales registrados.
     * @param {Array} defaultUsers - Lista por defecto si no hay datos guardados.
     * @returns {Array} usuarios
     */
    static loadUsuarios(defaultUsers = []) {
        const saved = localStorage.getItem(STORAGE_KEYS.USUARIOS_DATA);
        if (!saved) {
            this.saveUsuarios(defaultUsers);
            return defaultUsers;
        }
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultUsers;
        } catch (e) {
            console.error('[StorageRepository] Error al cargar lista de usuarios:', e);
            return defaultUsers;
        }
    }

    /**
     * Guarda la lista de usuarios/profesionales.
     * @param {Array} usuarios
     */
    static saveUsuarios(usuarios) {
        try {
            localStorage.setItem(STORAGE_KEYS.USUARIOS_DATA, JSON.stringify(usuarios));
            return true;
        } catch (e) {
            console.error('[StorageRepository] Error al guardar lista de usuarios:', e);
            return false;
        }
    }
}
