// js/core/catalogoMedicamentos.js
/**
 * Catálogo institucional de medicamentos vasoactivos y sedoanalgesia.
 * Incluye rangos terapéuticos seguros pediátricos y códigos de color visual pastel.
 */

export const medInfo = {
    'midazolam': { color: '#e3f2fd', range: '0.5 - 6 mcgr/kg/min' },     // azul pastel
    'fentanyl': { color: '#f3e5f5', range: '0.5 - 5 mcgr/kg/hr' },       // morado pastel
    'fentanilo': { color: '#f3e5f5', range: '0.5 - 5 mcgr/kg/hr' },
    'propofol': { color: '#e8f5e9', range: '0.3 - 0.6 mg/kg/hr' },       // verde pastel
    'adrenalina': { color: '#ffebee', range: '0.05 - 2 mcgr/kg/min' },    // rojo pastel
    'dopamina': { color: '#fff3e0', range: '2 - 20 mcgr/kg/min' },       // naranja pastel
    'dobutamina': { color: '#e0f7fa', range: '5 - 20 mcgr/kg/min' },     // cian pastel
    'norepinefrina': { color: '#fce4ec', range: '0.05 - 2 mcgr/kg/min' }, // rosa pastel
    'milrinona': { color: '#ede7f6', range: '0.25 - 0.75 mcgr/kg/min' }, // violeta pastel
    'nitroglicerina': { color: '#fbe9e7', range: '0.5 - 20 mcgr/kg/min' },// mamey pastel
    'nitroprusiato': { color: '#e8eaf6', range: '0.05 - 0.8 mcgr/kg/min' } // indigo pastel
};

export const defaultMeds = [
    { nombre: 'Dopamina', dosis: 5, diluyente: 12, velocidad: 1, unidad: 'mcg/kg/min', farmaco_unidad: 'mg', equiv_unidad: 'mcg/kg/min', velocidad2: 2, equiv_unidad2: 'mcg/kg/min' },
    { nombre: 'Dobutamina', dosis: 5, diluyente: 12, velocidad: 1, unidad: 'mcg/kg/min', farmaco_unidad: 'mg', equiv_unidad: 'mcg/kg/min', velocidad2: 2, equiv_unidad2: 'mcg/kg/min' },
    { nombre: 'Norepinefrina', dosis: 0.1, diluyente: 12, velocidad: 1, unidad: 'mcg/kg/min', farmaco_unidad: 'mg', equiv_unidad: 'mcg/kg/min', velocidad2: 2, equiv_unidad2: 'mcg/kg/min' },
    { nombre: 'Adrenalina', dosis: 0.1, diluyente: 12, velocidad: 1, unidad: 'mcg/kg/min', farmaco_unidad: 'mg', equiv_unidad: 'mcg/kg/min', velocidad2: 2, equiv_unidad2: 'mcg/kg/min' },
    { nombre: 'Milrinona', dosis: 0.5, diluyente: 12, velocidad: 1, unidad: 'mcg/kg/min', farmaco_unidad: 'mg', equiv_unidad: 'mcg/kg/min', velocidad2: 2, equiv_unidad2: 'mcg/kg/min' },
    { nombre: 'Midazolam', dosis: 0.1, diluyente: 12, velocidad: 1, unidad: 'mg/kg/h', farmaco_unidad: 'mg', equiv_unidad: 'mg/kg/h', velocidad2: 2, equiv_unidad2: 'mg/kg/h' },
    { nombre: 'Fentanyl', dosis: 1, diluyente: 12, velocidad: 1, unidad: 'mcg/kg/h', farmaco_unidad: 'mcg', equiv_unidad: 'mcg/kg/h', velocidad2: 2, equiv_unidad2: 'mcg/kg/h' },
    { nombre: 'Dexmedetomidina', dosis: 0.5, diluyente: 12, velocidad: 1, unidad: 'mcg/kg/h', farmaco_unidad: 'mcg', equiv_unidad: 'mcg/kg/h', velocidad2: 2, equiv_unidad2: 'mcg/kg/h' },
    { nombre: 'Propofol', dosis: 1, diluyente: 12, velocidad: 1, unidad: 'mg/kg/h', farmaco_unidad: 'mg', equiv_unidad: 'mg/kg/h', velocidad2: 2, equiv_unidad2: 'mg/kg/h' }
];

export function getMedInfo(nombre) {
    if (!nombre) return null;
    return medInfo[nombre.trim().toLowerCase()] || null;
}
