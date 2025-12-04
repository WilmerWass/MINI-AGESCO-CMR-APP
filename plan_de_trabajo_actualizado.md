# Plan de Trabajo Actualizado: MINI AGESCO CRM PC-BETA (con Electron)

Este documento detalla el plan de desarrollo para la versión de escritorio de AGESCO CRM, integrando funcionalidades completas de UI/UX, capacidades offline y una estrategia de sincronización adaptada a las necesidades de negocio.

## Arquitectura y Tecnologías Clave

*   **Framework Principal:** Electron (para la aplicación de escritorio multiplataforma)
*   **Interfaz de Usuario (UI):** React con TypeScript
*   **Empaquetador/Servidor de Desarrollo:** Vite
*   **Librería de Componentes UI:** Material-UI (MUI)
*   **Enrutamiento Frontend:** `react-router-dom`
*   **Base de Datos Local:** SQLite (para almacenamiento de datos offline)
*   **Comunicación IPC:** `contextBridge` de Electron (para interacción segura entre el renderer y el main process)
*   **Objetivo General:** Crear una aplicación de escritorio instalable que encapsule la funcionalidad del CRM, permitiendo un acceso rápido, robustas capacidades offline y una sincronización inteligente.

## Fases del Proyecto y Tareas Detalladas

---

### Fase 1: Interfaz de Inicio de Sesión (COMPLETA)

*   **Objetivo:** Permitir a los usuarios acceder al sistema.
*   **Estado:** `Completa`
*   **Tecnologías:** React, Material-UI
*   **Descripción:**
    *   Componente `Login.tsx`: Formulario de inicio de sesión centrado con diseño Material-UI.
    *   Campos: Correo electrónico (`TextField`), Contraseña (`TextField`).
    *   Botón "Iniciar Sesión" (`Button`), con lógica de autenticación simulada.
    *   Usuarios de prueba: `admin@agesco.com`, `asesor@agesco.com` (con cualquier contraseña no vacía).
    *   Redirección exitosa a `/dashboard`.

---

### Fase 2: Interfaz de Inicio / Dashboard Principal (COMPLETA)

*   **Objetivo:** Proveer la estructura base de la aplicación post-login.
*   **Estado:** `Completa`
*   **Tecnologías:** React, Material-UI, `react-router-dom` (preparado para integrar)
*   **Descripción:**
    *   Componente `App.tsx`: Gestiona el estado de autenticación y carga el `ThemeProvider` de Material-UI y `CssBaseline`.
    *   Estructura general del dashboard (`Home.tsx` como placeholder inicial):
        *   `AppBar` (barra superior) con título dinámico y botón "Cerrar Sesión".
        *   Contenido principal organizado en un `Container` de Material-UI.
        *   Placeholder de widgets de dashboard (`Grid`, `Paper`) para visualizar datos clave.

---

### Fase 3: Integración de la Arquitectura Frontend y Módulos de UI/UX (COMPLETA)

*   **Objetivo:** Establecer la estructura de navegación y diseñar las interfaces detalladas de cada módulo.
*   **Estado:** `Completa`
*   **Tecnologías:** `react-router-dom`, React, Material-UI
*   **Tareas:**

    1.  **Configuración de Enrutamiento (Frontend):**
        *   Instalar `react-router-dom`.
        *   Configurar `BrowserRouter` (o `HashRouter` para compatibilidad) en `App.tsx`.
        *   Definir rutas para: `/login`, `/dashboard`, `/dashboard/informe`, `/dashboard/clientes`, `/dashboard/agescom`, `/dashboard/avisos`, `/dashboard/enlaces`, `/dashboard/perfil`.
        *   **Estado:** `Completa`

    2.  **Componente de Layout del Dashboard (`DashboardLayout.tsx`):**
        *   Crear un componente que sirva como plantilla para todas las pantallas del dashboard.
        *   Incluir `AppBar` (encabezado dinámico), `Drawer` (barra lateral expandible/colapsable) con menú de navegación y menú de usuario.
        *   El área de contenido principal cargará dinámicamente el componente de la página actual según la ruta.
        *   **Estado:** `Completa`

    3.  **Implementación de Componentes por Módulo (UI/UX completa):**
        *   **Informe General (`src/app/dashboard/informe/page.tsx`):**
            *   **Estado:** `Completa`
            *   KPIs por Período con Tabs implementados
            *   Desglose de Clientes con tablas de "Clientes por Asesor" y "Clientes por Estado"

        *   **Gestión de Clientes (`src/app/dashboard/clientes/page.tsx`):**
            *   **Estado:** `Completa`
            *   Tabla de clientes con filtrado
            *   Formulario completo (ClientForm) con 5 pestañas
            *   Funcionalidad CRUD básica

        *   **Gestión de AG.ES.COM (`src/app/dashboard/agescom/page.tsx`):**
            *   **Estado:** `Completa`
            *   Filtros funcionales
            *   Tabla de agentes con acciones CRUD

        *   **Avisos y Gestiones (`src/app/dashboard/avisos/page.tsx`):**
            *   **Estado:** `Completa`
            *   Grid de tarjetas de avisos
            *   Funcionalidad de marcar como visto/reabrir

        *   **Enlaces Directos (`src/app/dashboard/enlaces/page.tsx`):**
            *   **Estado:** `Completa`
            *   Grid de tarjetas de enlaces
            *   Funcionalidad CRUD para admin

        *   **Perfil de Usuario (`src/app/dashboard/perfil/page.tsx`):**
            *   **Estado:** `Completa`
            *   Tarjeta de perfil con avatar
            *   Sección de gestión de usuarios (solo admin)

---

### Fase 4: Implementación de Almacenamiento Local (SQLite) y Lógica Offline

*   **Objetivo:** Habilitar el funcionamiento offline completo y la persistencia local de datos.
*   **Estado:** `Pendiente`
*   **Tecnologías:** SQLite, `sqlite3` (en main process), `contextBridge` (IPC), `react-query` (opcional para gestión de datos en frontend)
*   **Tareas:**

    1.  **Configuración de SQLite en Proceso Principal:**
        *   Instalar `sqlite3` y configurar la inicialización de la base de datos local en `electron/main.ts`.
        *   Definir el esquema de la base de datos para `Clientes`, `Agentes`, `Avisos`, `Usuarios`, etc. Incluyendo el campo `asesorId` para la propiedad de los datos.
        *   Crear funciones de CRUD (Crear, Leer, Actualizar, Eliminar) para cada entidad en el proceso principal.

    2.  **Exposición de API de Base de Datos Local a Renderer:**
        *   En `electron/preload.ts`, utilizar `contextBridge` para exponer un API seguro que permita al frontend de React interactuar con las funciones de la base de datos local del proceso principal. Esto reemplazará las simulaciones de datos.

    3.  **Adaptación de Componentes Frontend para Usar SQLite:**
        *   Modificar los componentes de los módulos (Fase 3) para que realicen sus operaciones de lectura y escritura de datos a través del API expuesto por `preload.js` hacia la base de datos SQLite local.
        *   Implementar una estrategia 'Offline-First': la UI siempre interactúa con la BD local.

---

### Fase 5: Activación de la Sincronización y Gestión de Permisos

*   **Objetivo:** Sincronizar datos local y remotamente, respetando la propiedad de los datos del asesor.
*   **Estado:** `Pendiente`
*   **Tecnologías:** Node.js `fetch` (en main process), gestión de estados de red, lógica de resolución de conflictos.
*   **Tareas:**

    1.  **Modelo de Datos con Propiedad:**
        *   Asegurar que todas las tablas de datos relevantes (especialmente `Clientes`) incluyan un campo `asesorId` para indicar la propiedad.
        *   Definir qué entidades son "privadas" (por asesor) y cuáles son "globales" (compartidas por todos los asesores).

    2.  **Módulo de Sincronización en Proceso Principal:**
        *   Implementar un servicio en `electron/main.ts` que monitoree el estado de la conexión a internet.
        *   Cuando haya conexión, iniciar un proceso de sincronización en segundo plano.

    3.  **Lógica de Sincronización de Datos Privados (Clientes):**
        *   Al **enviar** (push) cambios de clientes modificados localmente al servidor remoto: Incluir el `asesorId` del usuario autenticado. El backend debe verificar la autorización.
        *   Al **recibir** (pull) datos de clientes del servidor: Filtrar por `asesorId` del usuario actual (solo clientes propios o clientes explícitamente compartidos con este asesor si aplica).

    4.  **Lógica de Sincronización de Datos Compartidos:**
        *   Gestionar la sincronización de entidades "globales" (ej. compañías de seguros, tipos de póliza, avisos generales) a través de endpoints específicos, sin filtrar por `asesorId`, permitiendo que todos los asesores tengan acceso a la misma información compartida.

    5.  **Resolución de Conflictos:**
        *   Definir una estrategia para resolver conflictos cuando los mismos datos son modificados tanto localmente como en el servidor remoto (ej. "last-write-wins", sellos de tiempo, o estrategias más complejas).

    6.  **Indicadores de Sincronización en UI:**
        *   Mostrar el estado de la sincronización en la interfaz de usuario (ej. "Sincronizando...", "Última sincronización: X", "Sin conexión").

---

### Fase 6: Funcionalidades Adicionales (FUTURA)

*   **Objetivo:** Implementar características avanzadas según las necesidades del CRM.
*   **Estado:** `Pendiente`
*   **Tareas:**
    *   **Integración de Notificaciones por Correo Electrónico:** Permitir el envío automático de notificaciones (ej. nuevos avisos, gestiones pendientes) a asesores vía email, configurando un servicio SMTP externo (ej. SendGrid, Mailgun) en el backend.
    *   Detallar funcionalidades como exportación/importación de datos, reportes avanzados, gestión de roles y permisos más granular, notificaciones push, integración con calendarios, etc.
