# Documento de Análisis de Sistemas

## 1. Nombre del Sistema
**Aminas - PWA de Infusiones Pediátricas**

## 2. Descripción Detallada del Sistema
Aminas es una Aplicación Web Progresiva (PWA) médica diseñada para agilizar el cálculo preciso de infusiones pediátricas. Desarrollada con HTML, CSS y JavaScript, funciona 100% offline tras su instalación. Permite cálculos bidireccionales: ingresar la velocidad (ml/h) para obtener la dosis, o viceversa, basándose en el peso del paciente. Su diseño sin dependencias externas garantiza disponibilidad inmediata y protege la privacidad de los datos en entornos hospitalarios.

## 3. Elementos Externos que se Comunican con el Sistema
Debido a su funcionamiento estrictamente offline, el sistema interactúa con:
1. **Navegador y Sistema Operativo:** Para renderizar la interfaz web y permitir su instalación como aplicación en dispositivos móviles o PC.
2. **Usuario Final (Personal de Salud):** Ingresa los datos médicos y recibe los cálculos procesados.
3. **Bombas de Infusión (Interacción Indirecta):** El usuario programa manualmente las bombas físicas basándose en los resultados precisos generados por el sistema.
