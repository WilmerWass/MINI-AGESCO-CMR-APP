# Plan de Trabajo: MINI AGESCO CMR PC-BETA (con Electron)

Este documento describe el plan de desarrollo para una versión "mini" de AGESCO CMR PC, que se construirá como una aplicación de escritorio multiplataforma utilizando **Electron**.

## Arquitectura y Tecnologías

*   **Framework Principal:** Electron
*   **Interfaz de Usuario (UI):** React con TypeScript
*   **Empaquetador:** Vite
*   **Objetivo:** Crear una aplicación de escritorio instalable que encapsule la funcionalidad del CRM, permitiendo un acceso más rápido y capacidades offline en el futuro.

## Fase 1: Interfaz de Inicio de Sesión

*   **Objetivo:** Crear la pantalla de login.
*   **Estado:** `Completa`
*   **Tareas:**
    *   Diseñar y construir la interfaz de usuario para el inicio de sesión dentro de la ventana de Electron.
    *   Permitir el acceso utilizando los siguientes usuarios de prueba:
        *   `admin@agesco.com`
        *   `asesor@agesco.com`
    *   La lógica de autenticación es simulada y permite el acceso con cualquier contraseña.

## Fase 2: Interfaz de Inicio (Dashboard)

*   **Objetivo:** Crear la pantalla principal que se muestra después del login.
*   **Estado:** `Completa`
*   **Tareas:**
    *   Se ha creado un componente `Home` que actúa como dashboard.
    *   Muestra un mensaje de bienvenida con el email del usuario.
    *   Incluye un botón para cerrar sesión que devuelve al usuario a la pantalla de login.
    *   Esta sección servirá como un contenedor principal para futuros módulos.

## Fase 3: Módulo Funcional "AG.ES.COM. DISPONIBLES"

*   **Objetivo:** Implementar la primera funcionalidad principal de la aplicación.
*   **Estado:** `Pendiente`
*   **Tareas:**
    *   Crear la interfaz de usuario para la sección "AG.ES.COM. DISPONIBLES".
    *   Conectar la interfaz a los datos locales para mostrar una lista (simulada o real) de clientes disponibles.
    *   Implementar la funcionalidad básica para visualizar los clientes.

## Fase 4: Activación de la Sincronización

*   **Objetivo:** Habilitar la sincronización de datos.
*   **Estado:** `Pendiente`
*   **Tareas:**
    *   Activar y configurar el módulo de sincronización.
    *   Asegurar que los datos se mantengan consistentes.

## Fase 5: Funcionalidades Futuras

*   **Objetivo:** Espacio reservado para las próximas características.
*   **Estado:** `Pendiente`
*   **Tareas:**
    *   Aquí se detallarán las futuras funcionalidades, como la edición de clientes, gestión de usuarios, etc.

## Fase 6: Guías Visuales

*   **Objetivo:** Utilizar guías visuales para el desarrollo de la interfaz.
*   **Estado:** `Iniciado`
*   **Tareas:**
    *   Se ha creado la carpeta `GUIAS`.
    *   Se ha añadido la primera imagen de referencia: `guia img - pagina de inicio.png`.
    *   El desarrollo de la interfaz se basará en estas guías.