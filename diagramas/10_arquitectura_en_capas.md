# Diagrama de Arquitectura en Capas — Aminas PWA

> **Diseño del sistema.** Organización real del código de la versión final (rama `develop`): 4 capas más la infraestructura PWA. Las flechas del diagrama 2 se obtuvieron de los `import` de cada archivo, así que representan exactamente las dependencias del código.
> Actualiza el diagrama de arquitectura de la primera versión, que incluía componentes planeados que no se construyeron (por ejemplo, un adaptador de API simulada).

---

## 1. Vista general de las capas

```mermaid
flowchart TB
    classDef c1 fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e;
    classDef c2 fill:#ede9fe,stroke:#6d28d9,color:#4c1d95;
    classDef c3 fill:#dcfce7,stroke:#15803d,color:#14532d;
    classDef c4 fill:#fef9c3,stroke:#ca8a04,color:#713f12;
    classDef c5 fill:#f1f5f9,stroke:#64748b,color:#334155;

    U(["👤 Personal de salud"])

    subgraph L1 ["1 · PRESENTACIÓN — index.html, style.css, js/ui/"]
        P["4 vistas + 2 modales<br/>Generación de HTML (vistas)<br/>Estilos responsivos e impresión"]:::c1
    end
    subgraph L2 ["2 · CONTROLADORES — js/main.js, js/controllers/"]
        C["Navegación entre vistas · Eventos del usuario<br/>Control de acceso al navegar · Coordinación de servicios"]:::c2
    end
    subgraph L3 ["3 · DOMINIO / LÓGICA DE NEGOCIO — js/core/"]
        D["Cálculo fisiológico · Catálogo de fármacos<br/>Reglas de agenda · Usuarios · Permisos (RBAC) · Historial"]:::c3
    end
    subgraph L4 ["4 · PERSISTENCIA — js/data/"]
        R["StorageRepository (patrón Repositorio)"]:::c4
        LS[("localStorage<br/>5 claves JSON")]:::c4
    end
    subgraph INF ["INFRAESTRUCTURA PWA"]
        SW["sw.js · Service Worker"]:::c5
        CS[("Cache Storage<br/>App Shell")]:::c5
        MF["manifest.json · icono.png"]:::c5
    end

    U --> P
    P -- "eventos (clic, input)" --> C
    C -- "HTML generado / datos para mostrar" --> P
    C --> D
    C --> R
    R --> LS
    SW --> CS
    CS -. "sirve los archivos sin internet" .-> P
    MF -. "permite instalar la app" .-> U
```

**Regla de dependencia:** cada capa solo usa a las capas de abajo. El dominio (capa 3) **no** conoce la interfaz ni el almacenamiento: recibe datos y regresa resultados. Por eso el núcleo de cálculo se puede probar o reutilizar por separado.

---

## 2. Módulos y dependencias reales

```mermaid
flowchart LR
    classDef c1 fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e;
    classDef c2 fill:#ede9fe,stroke:#6d28d9,color:#4c1d95;
    classDef c3 fill:#dcfce7,stroke:#15803d,color:#14532d;
    classDef c4 fill:#fef9c3,stroke:#ca8a04,color:#713f12;

    subgraph UI ["Presentación · js/ui"]
        authView["authView.js"]:::c1
        dashboardView["dashboardView.js"]:::c1
        citasView["citasView.js"]:::c1
        modalReporteView["modalReporteView.js"]:::c1
        historialView["historialView.js"]:::c1
    end

    subgraph CTRL ["Controladores · js/controllers + main.js"]
        main["main.js"]:::c2
        authC["authController.js"]:::c2
        dashC["dashboardController.js"]:::c2
        calcC["calculadoraController.js"]:::c2
        citasC["citasController.js"]:::c2
        repC["reporteController.js"]:::c2
        histC["historialController.js"]:::c2
    end

    subgraph CORE ["Dominio · js/core"]
        calculo["calculoFisiologico.js"]:::c3
        catalogo["catalogoMedicamentos.js"]:::c3
        agenda["agendaService.js"]:::c3
        auth["authService.js"]:::c3
        permisos["permisosService.js"]:::c3
        historial["historialService.js"]:::c3
    end

    subgraph DATA ["Persistencia · js/data"]
        repo["storageRepository.js"]:::c4
    end

    main --> authC & dashC & calcC & citasC & repC & histC
    main --> permisos & repo

    authC --> authView & auth & permisos & repo
    dashC --> dashboardView & agenda & catalogo & permisos & repo
    calcC --> calculo & catalogo & permisos & repo
    citasC --> citasView & agenda & auth & catalogo & permisos & repo
    repC --> modalReporteView & historial & permisos & repo
    histC --> historialView & historial & permisos & repo

    dashboardView --> catalogo
    citasView --> agenda
    modalReporteView --> calculo & catalogo
    permisos --> auth
```

---

## 3. Responsabilidad de cada capa

| Capa | Archivos | Responsabilidad | Qué **no** hace |
| :--- | :--- | :--- | :--- |
| **1. Presentación** | `index.html`, `style.css`, `js/ui/authView.js`, `dashboardView.js`, `citasView.js`, `modalReporteView.js`, `historialView.js` | Estructura de las pantallas, estilos responsivos y de impresión, y funciones que convierten datos en HTML | No guarda datos ni aplica reglas de negocio |
| **2. Controladores** | `js/main.js`, `js/controllers/authController.js`, `dashboardController.js`, `calculadoraController.js`, `citasController.js`, `reporteController.js`, `historialController.js` | Escuchan eventos, leen formularios, llaman a servicios y al repositorio, y cambian de vista. `main.js` crea los controladores y los conecta con funciones (*callbacks*) | No contienen fórmulas ni acceden directo a `localStorage` |
| **3. Dominio** | `js/core/calculoFisiologico.js`, `catalogoMedicamentos.js`, `agendaService.js`, `authService.js`, `permisosService.js`, `historialService.js` | Fórmulas de infusión, catálogo y rangos, reglas de citas (no empalme), usuarios, matriz de permisos e historial | No toca el HTML ni el almacenamiento |
| **4. Persistencia** | `js/data/storageRepository.js` | Lee y escribe las 5 claves de `localStorage`, con datos por defecto y manejo de errores | No decide reglas de negocio |
| **Infraestructura PWA** | `sw.js`, `manifest.json`, `icono.png` | Caché offline (24 archivos, versión `aminas-pwa-v16`) e instalación en el dispositivo | — |

---

## 4. Beneficios de esta arquitectura

1. **Separación de responsabilidades:** cada archivo tiene una sola función clara; un cambio de diseño visual no afecta las fórmulas.
2. **Núcleo de cálculo protegido:** `calculoFisiologico.js` son funciones puras sin dependencias; ningún otro módulo modifica las fórmulas.
3. **Permisos centralizados:** todas las reglas de acceso están en `permisosService.js`; agregar un rol solo requiere cambiar la matriz.
4. **Persistencia reemplazable:** como todo pasa por `StorageRepository`, se puede cambiar `localStorage` por una base de datos o un servidor sin tocar las otras capas.
5. **Offline real:** el Service Worker sirve la aplicación desde caché, así que funciona sin internet en áreas hospitalarias sin señal.
