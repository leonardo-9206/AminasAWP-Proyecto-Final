// js/core/calculoFisiologico.js
/**
 * Motor de cálculo fisiológico y farmacológico pediátrico.
 * REGLA DE ORO: Las fórmulas y conversiones son exactas e invariables.
 */

/**
 * Retorna la cantidad de decimales sugerida según el fármaco.
 * Fármacos de alta potencia como norepinefrina, adrenalina y milrinona requieren 3 decimales.
 */
export function getDecimals(medName, defaultDec = 1) {
    if (!medName) return defaultDec;
    const clean = medName.trim().toLowerCase();
    if (['norepinefrina', 'adrenalina', 'milrinona'].includes(clean)) {
        return 3;
    }
    return defaultDec;
}

/**
 * Calcula la cantidad de soluto (en mg) necesaria a partir de la dosis deseada y la velocidad de bomba.
 */
export function calculateFarmacoMg({ dosis, peso, vol_final_ml, velocidad_ml_h, unidad }) {
    const d = parseFloat(dosis) || 0;
    const p = parseFloat(peso) || 0;
    const vf = parseFloat(vol_final_ml) || 0;
    const vel = parseFloat(velocidad_ml_h) || 0;

    if (p <= 0 || vel <= 0 || vf <= 0 || d <= 0) return 0;

    let farmaco_mg = 0;
    if (unidad === 'mcg/kg/min') {
        farmaco_mg = (d * p * vf * 60) / (1000 * vel);
    } else if (unidad === 'mcg/kg/h') {
        farmaco_mg = (d * p * vf) / (1000 * vel);
    } else if (unidad === 'mg/kg/h') {
        farmaco_mg = (d * p * vf) / vel;
    }

    return farmaco_mg;
}

/**
 * Retorna el valor de fármaco para mostrar en el input según la unidad seleccionada (mg o mcg).
 */
export function calculateFarmacoDisplay({ dosis, peso, vol_final_ml, velocidad_ml_h, unidad, farmaco_unidad }) {
    const farmaco_mg = calculateFarmacoMg({ dosis, peso, vol_final_ml, velocidad_ml_h, unidad });
    if (farmaco_mg <= 0) return 0;
    return farmaco_unidad === 'mcg' ? farmaco_mg * 1000 : farmaco_mg;
}

/**
 * Cálculo inverso: A partir de los miligramos/microgramos preparados y la velocidad de infusión,
 * calcula la dosis real recibida por el paciente.
 */
export function calculateDosis({ input_farmaco, farmaco_unidad, peso, vol_final_ml, velocidad_ml_h, unidad }) {
    const p = parseFloat(peso) || 0;
    const vf = parseFloat(vol_final_ml) || 0;
    const vel = parseFloat(velocidad_ml_h) || 0;
    const rawFarmaco = parseFloat(input_farmaco) || 0;

    if (p <= 0 || vf <= 0 || vel <= 0 || rawFarmaco <= 0) return 0;

    const farmaco_mg = farmaco_unidad === 'mcg' ? rawFarmaco / 1000 : rawFarmaco;
    if (farmaco_mg <= 0) return 0;

    let dosis = 0;
    if (unidad === 'mcg/kg/min') {
        dosis = (farmaco_mg * 1000 * vel) / (p * vf * 60);
    } else if (unidad === 'mcg/kg/h') {
        dosis = (farmaco_mg * 1000 * vel) / (p * vf);
    } else if (unidad === 'mg/kg/h') {
        dosis = (farmaco_mg * vel) / (p * vf);
    }

    return dosis;
}

/**
 * Calcula la equivalencia de dosis entregada a una velocidad de infusión dada (ej. 1 ml/h o velocidad 2).
 */
export function calculateEquivalenceBySpeed({ input_farmaco, farmaco_unidad, peso, vol_final_ml, speed, targetUnit }) {
    const p = parseFloat(peso) || 0;
    const vf = parseFloat(vol_final_ml) || 0;
    const vel = parseFloat(speed) || 0;
    const rawFarmaco = parseFloat(input_farmaco) || 0;

    if (p <= 0 || vf <= 0 || vel <= 0 || rawFarmaco <= 0) return 0;

    const farmaco_mg = farmaco_unidad === 'mcg' ? rawFarmaco / 1000 : rawFarmaco;
    if (farmaco_mg <= 0) return 0;

    let result = 0;
    if (targetUnit === 'mcg/kg/min') {
        result = (farmaco_mg * 1000 * vel) / (p * vf * 60);
    } else if (targetUnit === 'mcg/kg/h') {
        result = (farmaco_mg * 1000 * vel) / (p * vf);
    } else if (targetUnit === 'mg/kg/h') {
        result = (farmaco_mg * vel) / (p * vf);
    }

    return result;
}
