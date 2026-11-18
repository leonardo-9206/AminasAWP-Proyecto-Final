// js/main.js
/**
 * Punto de entrada principal (Application Entry Point) - Aminas PWA.
 * Inicializa los controladores de vistas y el registro del Service Worker.
 */

import { CalculadoraController } from './controllers/calculadoraController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar controlador de calculadora
    const calculadoraCtrl = new CalculadoraController();
    calculadoraCtrl.init();

    // Registro seguro de Service Worker para capacidades Offline PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('[PWA] Service Worker registrado con éxito:', reg.scope))
                .catch(err => console.error('[PWA] Error al registrar Service Worker:', err));
        });
    }
});
