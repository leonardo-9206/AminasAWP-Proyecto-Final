// js/main.js
/**
 * Punto de entrada principal (Application Entry Point) - Aminas PWA.
 * Orquesta la navegación SPA entre el Dashboard, la Calculadora y la Agenda de Citas,
 * e inicializa el registro del Service Worker.
 */

import { DashboardController } from './controllers/dashboardController.js';
import { CalculadoraController } from './controllers/calculadoraController.js';
import { ReporteController } from './controllers/reporteController.js';
import { CitasController } from './controllers/citasController.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewDashboard = document.getElementById('view-dashboard');
    const viewCalculadora = document.getElementById('view-calculadora');
    const viewCitas = document.getElementById('view-citas');

    // Inicializar controlador de Reporte y Entrega de Guardia
    const reporteCtrl = new ReporteController();

    // Inicializar controlador de Calculadora
    const calculadoraCtrl = new CalculadoraController();

    // Inicializar controlador de Dashboard
    const dashboardCtrl = new DashboardController({
        onSelectPatient: (patientId) => {
            calculadoraCtrl.openPatient(patientId);
            showView('calculadora');
        },
        onNewPatient: () => {
            calculadoraCtrl.addNewPatientAndOpen();
            showView('calculadora');
        },
        onNavigateToCitas: () => {
            showView('citas');
        }
    });

    // Inicializar controlador de Citas y Agenda
    const citasCtrl = new CitasController({
        onNavigateToDashboard: () => {
            dashboardCtrl.render();
            showView('dashboard');
        },
        onNavigateToCalculadora: (patientId) => {
            if (patientId) {
                calculadoraCtrl.openPatient(patientId);
            }
            showView('calculadora');
        }
    });

    // Configurar listeners de la Calculadora
    calculadoraCtrl.init({
        onBackToDashboard: () => {
            dashboardCtrl.render();
            showView('dashboard');
        },
        onGenerarReporte: (patient) => {
            reporteCtrl.open(patient);
        },
        onNavigateToCitas: () => {
            showView('citas');
        }
    });

    // Inicializar Dashboard y Citas
    dashboardCtrl.init();
    citasCtrl.init();

    // Función para cambiar de vista con animación suave
    function showView(viewName) {
        if (viewDashboard) viewDashboard.style.display = 'none';
        if (viewCalculadora) viewCalculadora.style.display = 'none';
        if (viewCitas) viewCitas.style.display = 'none';

        if (viewName === 'calculadora') {
            if (viewCalculadora) viewCalculadora.style.display = 'block';
        } else if (viewName === 'citas') {
            if (viewCitas) viewCitas.style.display = 'block';
            citasCtrl.render();
        } else {
            if (viewDashboard) viewDashboard.style.display = 'block';
            dashboardCtrl.render();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Iniciar por defecto en el Dashboard
    showView('dashboard');

    // Registro seguro de Service Worker para capacidades Offline PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('[PWA] Service Worker registrado con éxito:', reg.scope))
                .catch(err => console.error('[PWA] Error al registrar Service Worker:', err));
        });
    }
});
