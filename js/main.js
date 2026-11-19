// js/main.js
/**
 * Punto de entrada principal (Application Entry Point) - Aminas PWA.
 * Orquesta la navegación SPA entre el Dashboard y la Calculadora,
 * e inicializa el registro del Service Worker.
 */

import { DashboardController } from './controllers/dashboardController.js';
import { CalculadoraController } from './controllers/calculadoraController.js';
import { ReporteController } from './controllers/reporteController.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewDashboard = document.getElementById('view-dashboard');
    const viewCalculadora = document.getElementById('view-calculadora');

    // Inicializar controlador de Reporte y Entrega de Guardia
    const reporteCtrl = new ReporteController();

    // Función para cambiar de vista con animación suave
    function showView(viewName) {
        if (viewName === 'calculadora') {
            if (viewDashboard) viewDashboard.style.display = 'none';
            if (viewCalculadora) viewCalculadora.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (viewCalculadora) viewCalculadora.style.display = 'none';
            if (viewDashboard) viewDashboard.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Inicializar controlador de Calculadora
    const calculadoraCtrl = new CalculadoraController();
    calculadoraCtrl.init({
        onBackToDashboard: () => {
            dashboardCtrl.render();
            showView('dashboard');
        },
        onGenerarReporte: (patient) => {
            reporteCtrl.open(patient);
        }
    });

    // Inicializar controlador de Dashboard
    const dashboardCtrl = new DashboardController({
        onSelectPatient: (patientId) => {
            calculadoraCtrl.openPatient(patientId);
            showView('calculadora');
        },
        onNewPatient: () => {
            calculadoraCtrl.addNewPatientAndOpen();
            showView('calculadora');
        }
    });
    dashboardCtrl.init();

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
