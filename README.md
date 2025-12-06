# AGECO CRM

Una aplicación de escritorio para la gestión de relaciones con clientes (CRM), construida con tecnologías web modernas y empaquetada para su uso en escritorio con Electron.

## Características Principales

- **Autenticación Segura:** Sistema de login con roles (administrador, asesor) y contraseñas hasheadas.
- **Gestión de Usuarios:** Creación, edición y eliminación de usuarios del sistema (solo para administradores).
- **Gestión de Clientes:** CRUD completo para la cartera de clientes, asignados a cada asesor.
- **Gestión de Agentes:** CRUD para la gestión de agentes/compañías externas.
- **Sistema de Avisos:** Creación y seguimiento de avisos o tareas pendientes, asociadas a clientes y usuarios.
- **Panel de Informes:** Dashboard con KPIs y visualización de datos clave.
- **Perfiles de Usuario:** Edición de información personal y avatar.

## Tecnologías Utilizadas

- **Frontend:** React, TypeScript, Vite
- **UI:** Material-UI (MUI)
- **Backend y Entorno de Escritorio:** Electron, Node.js
- **Base de Datos:** SQLite3

## Puesta en Marcha

Sigue estos pasos para instalar y ejecutar el proyecto en un entorno de desarrollo.

### 1. Instalar Dependencias

Abre una terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 2. Ejecutar la Aplicación

Para iniciar la aplicación en modo de desarrollo (con recarga en caliente):
```bash
npm run dev:electron
```
