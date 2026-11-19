// js/main.js
/**
 * Punto de entrada principal (Application Entry Point) - Aminas PWA.
 * Orquesta la navegación SPA entre el Dashboard, la Calculadora, la Agenda de Citas
 * y el Historial de Reportes; aplica el control de acceso por rol al navegar
 * e inicializa el registro del Service Worker.
 */

import { DashboardController } from './controllers/dashboardController.js';
import { CalculadoraController } from './controllers/calculadoraController.js';
import { ReporteController } from './controllers/reporteController.js';
import { CitasController } from './controllers/citasController.js';
import { HistorialController } from './controllers/historialController.js';
import { AuthController } from './controllers/authController.js';
import { PermisosService, ACCIONES } from './core/permisosService.js';
import { StorageRepository } from './data/storageRepository.js';

document.addEventListener('DOMContentLoaded', () => {
    const views = {
        dashboard: document.getElementById('view-dashboard'),
        calculadora: document.getElementById('view-calculadora'),
        citas: document.getElementById('view-citas'),
        historial: document.getElementById('view-historial')
    };
    let currentView = 'dashboard';

    // Inicializar controlador de Autenticación y Perfiles
    const authCtrl = new AuthController({
        onUserChanged: () => {
            // Al cambiar de turno se re-aplican los permisos en todas las vistas
            calculadoraCtrl.applyPermissions();
            citasCtrl.render();
            historialCtrl.render();
            if (currentView === 'calculadora' && !puedeUsarCalculadora()) {
                showView('dashboard');
            } else {
                dashboardCtrl.render();
            }
        }
    });
    authCtrl.init();

    // Inicializar controlador de Reporte y Entrega de Guardia
    const reporteCtrl = new ReporteController({
        onHistorialChanged: () => historialCtrl.render()
    });

    // Inicializar controlador de Calculadora
    const calculadoraCtrl = new CalculadoraController();

    // Inicializar controlador de Dashboard
    const dashboardCtrl = new DashboardController({
        onSelectPatient: (patientId) => {
            if (!puedeUsarCalculadora(true)) return;
            calculadoraCtrl.openPatient(patientId);
            showView('calculadora');
        },
        onNewPatient: () => {
            calculadoraCtrl.addNewPatientAndOpen();
            showView('calculadora');
        },
        onNavigateToCitas: () => showView('citas'),
        onNavigateToHistorial: () => showView('historial')
    });

    // Inicializar controlador de Citas y Agenda
    const citasCtrl = new CitasController({
        onNavigateToDashboard: () => showView('dashboard'),
        onNavigateToCalculadora: (patientId) => {
            if (!puedeUsarCalculadora(true)) return;
            if (patientId) {
                calculadoraCtrl.openPatient(patientId);
            }
            showView('calculadora');
        }
    });

    // Inicializar controlador del Historial de Reportes
    const historialCtrl = new HistorialController({
        onNavigateToDashboard: () => showView('dashboard'),
        onOpenReporte: (registro) => reporteCtrl.openFromHistorial(registro)
    });

    // Configurar listeners de la Calculadora
    calculadoraCtrl.init({
        onBackToDashboard: () => showView('dashboard'),
        onGenerarReporte: (patient) => {
            reporteCtrl.open(patient, authCtrl.getActiveUser());
        },
        onNavigateToCitas: () => showView('citas')
    });

    // Inicializar Dashboard, Citas e Historial
    dashboardCtrl.init();
    citasCtrl.init();
    historialCtrl.init();

    /** Control de acceso a la calculadora según el rol en turno. */
    function puedeUsarCalculadora(avisar = false) {
        const usuario = StorageRepository.getActiveUser();
        const permitido = PermisosService.puede(usuario, ACCIONES.CALCULADORA_USAR);
        if (!permitido && avisar) {
            alert(PermisosService.mensajeDenegado(usuario));
        }
        return permitido;
    }

    // Función para cambiar de vista
    function showView(viewName) {
        if (viewName === 'calculadora' && !puedeUsarCalculadora(true)) {
            viewName = 'dashboard';
        }

        Object.values(views).forEach(v => {
            if (v) v.style.display = 'none';
        });

        const target = views[viewName] || views.dashboard;
        if (target) target.style.display = 'block';
        currentView = views[viewName] ? viewName : 'dashboard';

        if (currentView === 'citas') {
            citasCtrl.render();
        } else if (currentView === 'historial') {
            historialCtrl.render();
        } else if (currentView === 'calculadora') {
            calculadoraCtrl.applyPermissions();
        } else {
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
