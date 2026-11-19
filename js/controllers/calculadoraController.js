// js/controllers/calculadoraController.js
/**
 * Controlador de la Calculadora de Infusiones Pediátricas.
 * Capa de Aplicación / Controladores: orquesta la interfaz, eventos y servicios de dominio.
 */

import { defaultMeds, getMedInfo } from '../core/catalogoMedicamentos.js';
import {
    getDecimals,
    calculateFarmacoDisplay,
    calculateDosis,
    calculateEquivalenceBySpeed
} from '../core/calculoFisiologico.js';
import { StorageRepository } from '../data/storageRepository.js';

export class CalculadoraController {
    constructor() {
        this.pesoInput = document.getElementById('peso');
        this.tableBody = document.getElementById('table-body');
        this.btnAddRow = document.getElementById('btn-add-row');
        this.btnGenerarReporte = document.getElementById('btn-generar-reporte');
        this.tabsContainer = document.getElementById('tabs-container');
        this.currentPatientName = document.getElementById('current-patient-name');
        this.btnDeletePatient = document.getElementById('btn-delete-patient');
        this.btnBackToDashboard = document.getElementById('btn-back-to-dashboard');

        this.appState = StorageRepository.loadAppState(defaultMeds);
        this.onBackToDashboard = null;
        this.onGenerarReporte = null;
    }

    init(options = {}) {
        this.onBackToDashboard = options.onBackToDashboard || null;
        this.onGenerarReporte = options.onGenerarReporte || null;
        this.setupGlobalEventListeners();
        this.renderTabs();
        this.renderActivePatient();
    }

    openPatient(patientId) {
        this.appState = StorageRepository.loadAppState(defaultMeds);
        if (patientId) {
            const exists = this.appState.patients.some(p => p.id === patientId);
            if (exists) {
                this.appState.activePatientId = patientId;
                StorageRepository.saveAppState(this.appState);
            }
        }
        this.renderTabs();
        this.renderActivePatient();
    }

    addNewPatientAndOpen() {
        this.appState = StorageRepository.loadAppState(defaultMeds);
        this.createNewPatient();
    }

    setupGlobalEventListeners() {
        if (this.btnBackToDashboard) {
            this.btnBackToDashboard.addEventListener('click', () => {
                this.saveState();
                if (typeof this.onBackToDashboard === 'function') {
                    this.onBackToDashboard();
                }
            });
        }

        if (this.btnGenerarReporte) {
            this.btnGenerarReporte.addEventListener('click', () => {
                this.saveState();
                const activePatient = this.getActivePatientData();
                if (typeof this.onGenerarReporte === 'function') {
                    this.onGenerarReporte(activePatient);
                }
            });
        }
        this.pesoInput.addEventListener('input', () => {
            this.recalculateAllRows();
            this.saveState();
        });

        this.btnAddRow.addEventListener('click', () => {
            this.addRow({
                nombre: '',
                dosis: 0,
                diluyente: 12,
                velocidad: 1,
                unidad: 'mcg/kg/min',
                farmaco_unidad: 'mg',
                equiv_unidad: 'mcg/kg/min',
                velocidad2: 2,
                equiv_unidad2: 'mcg/kg/min'
            });
            this.saveState();
        });

        this.btnDeletePatient.addEventListener('click', () => {
            this.deleteCurrentPatient();
        });

        this.currentPatientName.addEventListener('blur', () => {
            this.saveState();
            this.renderTabs();
        });

        this.currentPatientName.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.currentPatientName.blur();
            }
        });
    }

    getActivePatientData() {
        this.saveState();
        return this.appState.patients.find(p => p.id === this.appState.activePatientId) || this.appState.patients[0];
    }

    saveState() {
        const activePatient = this.appState.patients.find(p => p.id === this.appState.activePatientId);
        if (!activePatient) return;

        activePatient.name = this.currentPatientName.innerText.trim() || `Paciente ${activePatient.id}`;
        activePatient.peso = this.pesoInput.value;

        const rows = this.tableBody.querySelectorAll('tr');
        activePatient.meds = Array.from(rows).map(tr => {
            const equivInp = tr.querySelector('.inp-equivalencia');
            const equiv2Inp = tr.querySelector('.inp-equivalencia2');
            const volFinalInp = tr.querySelector('.inp-vol-final');

            return {
                nombre: tr.querySelector('.inp-med').value,
                dosis: tr.querySelector('.inp-dosis').value,
                unidad: tr.querySelector('.sel-unidad').value,
                farmaco: tr.querySelector('.inp-farmaco').value,
                farmaco_unidad: tr.querySelector('.sel-farmaco-unidad').value,
                diluyente: tr.querySelector('.inp-diluyente').value,
                vol_final: volFinalInp ? volFinalInp.value : '',
                velocidad: tr.querySelector('.inp-velocidad').value,
                equiv: equivInp ? equivInp.value : '',
                equiv_unidad: tr.querySelector('.sel-equiv-unidad').value,
                velocidad2: tr.querySelector('.inp-velocidad2').value,
                equiv2: equiv2Inp ? equiv2Inp.value : '',
                equiv_unidad2: tr.querySelector('.sel-equiv-unidad2').value
            };
        });

        StorageRepository.saveAppState(this.appState);
    }

    renderTabs() {
        this.tabsContainer.innerHTML = '';
        this.appState.patients.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'tab' + (p.id === this.appState.activePatientId ? ' active' : '');
            btn.innerText = p.name || `Paciente ${p.id}`;
            btn.onclick = () => this.switchPatient(p.id);
            this.tabsContainer.appendChild(btn);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'tab tab-add';
        addBtn.innerText = '+ Nuevo';
        addBtn.onclick = () => this.createNewPatient();
        this.tabsContainer.appendChild(addBtn);
    }

    switchPatient(id) {
        this.saveState();
        this.appState.activePatientId = id;
        StorageRepository.saveAppState(this.appState);
        this.renderTabs();
        this.renderActivePatient();
    }

    createNewPatient() {
        this.saveState();
        const newId = this.appState.nextPatientId++;
        this.appState.patients.push({
            id: newId,
            name: `Paciente ${newId}`,
            peso: '',
            meds: JSON.parse(JSON.stringify(defaultMeds))
        });
        this.appState.activePatientId = newId;
        StorageRepository.saveAppState(this.appState);
        this.renderTabs();
        this.renderActivePatient();
    }

    deleteCurrentPatient() {
        if (this.appState.patients.length === 1) {
            alert('Debe haber al menos un paciente registrado.');
            return;
        }
        if (confirm(`¿Eliminar a ${this.currentPatientName.innerText}?`)) {
            this.appState.patients = this.appState.patients.filter(p => p.id !== this.appState.activePatientId);
            this.appState.activePatientId = this.appState.patients[0].id;
            this.saveState();
            this.renderTabs();
            this.renderActivePatient();
        }
    }

    renderActivePatient() {
        const activePatient = this.appState.patients.find(p => p.id === this.appState.activePatientId);
        if (!activePatient) return;

        this.currentPatientName.innerText = activePatient.name;
        this.pesoInput.value = activePatient.peso;
        this.tableBody.innerHTML = '';

        activePatient.meds.forEach(med => this.addRow(med));
        this.recalculateAllRows();
    }

    applyMedStyles(tr) {
        const input = tr.querySelector('.inp-med');
        const rangeDiv = tr.querySelector('.med-range');
        const medName = input.value.trim().toLowerCase();

        const info = getMedInfo(medName);
        if (info) {
            input.style.backgroundColor = info.color;
            rangeDiv.innerText = `Rango: ${info.range}`;
        } else {
            input.style.backgroundColor = '';
            rangeDiv.innerText = '';
        }
    }

    addRow(data) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td data-label="Medicamento" class="td-med-name">
                <input type="text" class="inp-med" value="${data.nombre}" placeholder="Nombre" readonly>
                <div class="med-range"></div>
            </td>
            <td data-label="Dosis Real"><input type="number" class="inp-dosis" value="${data.dosis || ''}" placeholder="0.0" step="0.01" min="0"></td>
            <td data-label="Unidad Dosis">
                <select class="sel-unidad">
                    <option value="mcg/kg/min" ${data.unidad === 'mcg/kg/min' ? 'selected' : ''}>mcg/kg/min</option>
                    <option value="mcg/kg/h" ${data.unidad === 'mcg/kg/h' ? 'selected' : ''}>mcg/kg/h</option>
                    <option value="mg/kg/h" ${data.unidad === 'mg/kg/h' ? 'selected' : ''}>mg/kg/h</option>
                </select>
            </td>
            <td data-label="Fármaco" class="td-farmaco">
                <div class="equiv-group">
                    <input type="number" class="inp-farmaco" value="${data.farmaco || ''}" placeholder="0.0" step="0.1" min="0" title="Calculado automáticamente">
                    <select class="sel-farmaco-unidad">
                        <option value="mg" ${data.farmaco_unidad === 'mg' ? 'selected' : ''}>mg</option>
                        <option value="mcg" ${data.farmaco_unidad === 'mcg' ? 'selected' : ''}>mcg</option>
                    </select>
                </div>
            </td>
            <td data-label="Diluyente (ml)"><input type="number" class="inp-diluyente" value="${data.diluyente}" step="0.1" min="0"></td>
            <td data-label="Vol. Final (ml)"><input type="number" class="inp-vol-final" readonly value="0"></td>
            <td data-label="Velocidad (ml/h)"><input type="number" class="inp-velocidad" value="${data.velocidad}" placeholder="1.0" step="0.1" min="0"></td>
            <td data-label="Equivalencia" class="td-equivalencia">
                <div class="equiv-group">
                    <input type="text" class="inp-equivalencia" readonly value="0" title="Dosis obtenida por cada 1 ml/h infundido">
                    <select class="sel-equiv-unidad">
                        <option value="mcg/kg/min" ${data.equiv_unidad === 'mcg/kg/min' ? 'selected' : ''}>mcg/kg/min</option>
                        <option value="mcg/kg/h" ${data.equiv_unidad === 'mcg/kg/h' ? 'selected' : ''}>mcg/kg/h</option>
                        <option value="mg/kg/h" ${data.equiv_unidad === 'mg/kg/h' ? 'selected' : ''}>mg/kg/h</option>
                    </select>
                </div>
            </td>
            <td data-label="Velocidad 2 (ml/h)"><input type="number" class="inp-velocidad2" value="${data.velocidad2}" placeholder="2.0" step="0.1" min="0"></td>
            <td data-label="Equivalencia 2" class="td-equivalencia">
                <div class="equiv-group">
                    <input type="text" class="inp-equivalencia2" readonly value="0" title="Dosis obtenida usando la Velocidad 2">
                    <select class="sel-equiv-unidad2">
                        <option value="mcg/kg/min" ${data.equiv_unidad2 === 'mcg/kg/min' ? 'selected' : ''}>mcg/kg/min</option>
                        <option value="mcg/kg/h" ${data.equiv_unidad2 === 'mcg/kg/h' ? 'selected' : ''}>mcg/kg/h</option>
                        <option value="mg/kg/h" ${data.equiv_unidad2 === 'mg/kg/h' ? 'selected' : ''}>mg/kg/h</option>
                    </select>
                </div>
            </td>
            <td><button class="btn btn-outline-danger btn-delete">X</button></td>
        `;

        if (!data.nombre) {
            tr.querySelector('.inp-med').removeAttribute('readonly');
        }

        this.tableBody.appendChild(tr);
        this.applyMedStyles(tr);
        this.attachRowEvents(tr);
        this.updateRowBaseCalculations(tr);
    }

    attachRowEvents(tr) {
        const inputs = tr.querySelectorAll('input, select');

        inputs.forEach(input => {
            input.addEventListener('change', () => this.saveState());
            if (input.type === 'number' || input.type === 'text') {
                input.addEventListener('input', () => this.saveState());
            }
        });

        const medInput = tr.querySelector('.inp-med');
        const farmacoInput = tr.querySelector('.inp-farmaco');
        const diluyenteInput = tr.querySelector('.inp-diluyente');
        const velocidadInput = tr.querySelector('.inp-velocidad');
        const dosisInput = tr.querySelector('.inp-dosis');
        const unidadSelect = tr.querySelector('.sel-unidad');
        const farmacoUnidadSelect = tr.querySelector('.sel-farmaco-unidad');

        const equivUnidadSelect = tr.querySelector('.sel-equiv-unidad');
        const velocidad2Input = tr.querySelector('.inp-velocidad2');
        const equivUnidad2Select = tr.querySelector('.sel-equiv-unidad2');

        const btnDelete = tr.querySelector('.btn-delete');

        medInput.addEventListener('input', () => this.applyMedStyles(tr));

        const triggerCalculateFarmaco = () => {
            this.updateRowBaseCalculations(tr);
            this.calculateFarmaco(tr);
            this.updateEquivalencias(tr);
        };

        dosisInput.addEventListener('input', triggerCalculateFarmaco);
        diluyenteInput.addEventListener('input', triggerCalculateFarmaco);
        unidadSelect.addEventListener('change', triggerCalculateFarmaco);
        farmacoUnidadSelect.addEventListener('change', triggerCalculateFarmaco);

        const triggerCalculateDose = () => {
            this.updateRowBaseCalculations(tr);
            this.calculateDose(tr);
            this.updateEquivalencias(tr);
        };

        velocidadInput.addEventListener('input', triggerCalculateDose);
        farmacoInput.addEventListener('input', triggerCalculateDose);

        equivUnidadSelect.addEventListener('change', () => this.updateEquivalencia1(tr));

        velocidad2Input.addEventListener('input', () => this.updateEquivalencia2(tr));
        equivUnidad2Select.addEventListener('change', () => this.updateEquivalencia2(tr));

        btnDelete.addEventListener('click', () => {
            tr.remove();
            this.saveState();
        });
    }

    recalculateAllRows() {
        const rows = this.tableBody.querySelectorAll('tr');
        rows.forEach(tr => {
            this.calculateFarmaco(tr);
            this.updateEquivalencias(tr);
        });
    }

    updateRowBaseCalculations(tr) {
        const diluyente = parseFloat(tr.querySelector('.inp-diluyente').value) || 0;
        const medName = tr.querySelector('.inp-med').value;
        const decimals = getDecimals(medName, 1);
        tr.querySelector('.inp-vol-final').value = diluyente > 0 ? diluyente.toFixed(decimals) : 0;
    }

    calculateFarmaco(tr) {
        const peso = parseFloat(this.pesoInput.value);
        if (!peso || peso <= 0) return;

        const dosis = parseFloat(tr.querySelector('.inp-dosis').value) || 0;
        const vol_final_ml = parseFloat(tr.querySelector('.inp-vol-final').value) || 0;
        const velocidad_ml_h = parseFloat(tr.querySelector('.inp-velocidad').value) || 0;
        const unidad = tr.querySelector('.sel-unidad').value;
        const farmaco_unidad = tr.querySelector('.sel-farmaco-unidad').value;
        const medName = tr.querySelector('.inp-med').value;

        if (velocidad_ml_h === 0 || vol_final_ml === 0) return;

        const displayVal = calculateFarmacoDisplay({
            dosis,
            peso,
            vol_final_ml,
            velocidad_ml_h,
            unidad,
            farmaco_unidad
        });

        const decimals = getDecimals(medName, 1);
        tr.querySelector('.inp-farmaco').value = displayVal > 0 ? displayVal.toFixed(decimals) : '';
    }

    calculateDose(tr) {
        const peso = parseFloat(this.pesoInput.value);
        if (!peso || peso <= 0) {
            tr.querySelector('.inp-farmaco').value = '';
            return;
        }

        const input_farmaco = tr.querySelector('.inp-farmaco').value;
        const farmaco_unidad = tr.querySelector('.sel-farmaco-unidad').value;
        const vol_final_ml = parseFloat(tr.querySelector('.inp-vol-final').value) || 0;
        const velocidad_ml_h = parseFloat(tr.querySelector('.inp-velocidad').value) || 0;
        const unidad = tr.querySelector('.sel-unidad').value;
        const medName = tr.querySelector('.inp-med').value;

        if (vol_final_ml === 0 || velocidad_ml_h === 0) return;

        const dosis = calculateDosis({
            input_farmaco,
            farmaco_unidad,
            peso,
            vol_final_ml,
            velocidad_ml_h,
            unidad
        });

        const decimals = getDecimals(medName, 2);
        tr.querySelector('.inp-dosis').value = dosis > 0 ? dosis.toFixed(decimals) : '';
    }

    updateEquivalencias(tr) {
        this.updateEquivalencia1(tr);
        this.updateEquivalencia2(tr);
    }

    updateEquivalencia1(tr) {
        const peso = parseFloat(this.pesoInput.value);
        const input_farmaco = tr.querySelector('.inp-farmaco').value;
        const farmaco_unidad = tr.querySelector('.sel-farmaco-unidad').value;
        const vol_final_ml = parseFloat(tr.querySelector('.inp-vol-final').value) || 0;
        const targetUnit = tr.querySelector('.sel-equiv-unidad').value;
        const medName = tr.querySelector('.inp-med').value;

        const equiv = calculateEquivalenceBySpeed({
            input_farmaco,
            farmaco_unidad,
            peso,
            vol_final_ml,
            speed: 1,
            targetUnit
        });

        const decimals = getDecimals(medName, 1);
        tr.querySelector('.inp-equivalencia').value = equiv > 0 ? equiv.toFixed(decimals) : '0';
    }

    updateEquivalencia2(tr) {
        const peso = parseFloat(this.pesoInput.value);
        const input_farmaco = tr.querySelector('.inp-farmaco').value;
        const farmaco_unidad = tr.querySelector('.sel-farmaco-unidad').value;
        const vol_final_ml = parseFloat(tr.querySelector('.inp-vol-final').value) || 0;
        const velocidad2 = parseFloat(tr.querySelector('.inp-velocidad2').value) || 0;
        const targetUnit2 = tr.querySelector('.sel-equiv-unidad2').value;
        const medName = tr.querySelector('.inp-med').value;

        const equiv2 = calculateEquivalenceBySpeed({
            input_farmaco,
            farmaco_unidad,
            peso,
            vol_final_ml,
            speed: velocidad2,
            targetUnit: targetUnit2
        });

        const decimals = getDecimals(medName, 1);
        tr.querySelector('.inp-equivalencia2').value = equiv2 > 0 ? equiv2.toFixed(decimals) : '0';
    }
}
