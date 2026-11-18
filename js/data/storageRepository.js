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
     * @returns {Array} citas
     */
    static loadCitas() {
        const saved = localStorage.getItem(STORAGE_KEYS.CITAS_DATA);
        if (!saved) return [];
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
            return {
                id: 1,
                nombre: 'Dr. Pediatra Guardia',
                rol: 'MEDICO_PEDIATRA'
            };
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
}
