# 🚀 MINI AGECO CRM (Beta)

![Status](https://img.shields.io/badge/Status-Beta%20v1.0.3-blue)
![Electron](https://img.shields.io/badge/Electron-v39-2F3241?logo=electron)
![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/Db-MongoDB-47A248?logo=mongodb)

CRM de escritorio ligero y potente para la gestión eficiente de clientes, agentes y pólizas. Diseñado para ofrecer alto rendimiento, funcionamiento offline (parcial) y una experiencia de usuario moderna.

## ✨ Características Principales

- **🔐 Seguridad Robusta:** Login con hashes Bcrypt y roles diferenciados (Admin/Asesor).
- **👥 Gestión Integral:**
  - **Clientes:** Vista 360°, historial y seguimiento.
  - **Agentes:** Base de datos de colaboradores externos.
  - **Usuarios:** Control de acceso interno.
- **💾 Respaldo y Datos:** Sistema de exportación/importación (JSON/CSV) integrado.
- **📊 Dashboard Inteligente:** KPIs en tiempo real y métricas clave.
- **🔔 Sistema de Avisos:** Gestión de tareas y recordatorios.

## 🛠 Stack Tecnológico

| Componente        | Tecnología                   |
| :---------------- | :--------------------------- |
| **Frontend**      | React 19 + TypeScript + Vite |
| **UI Framework**  | Material-UI (MUI v6)         |
| **Core**          | Electron v39                 |
| **Base de Datos** | MongoDB (Local/Atlas)        |

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos

- Node.js (v18 o superior)
- MongoDB (corriendo localmente o string de conexión Atlas)

### 1. Desarrollo Local

Para trabajar en el código fuente con recarga en caliente (HMR):

```bash
# Instalar dependencias
npm install

# Iniciar entorno de desarrollo
npm run dev:electron
```

### 2. Generar Ejecutable (.exe)

Para compilar la aplicación para producción (Windows):

```bash
# Compilar y empaquetar
npm run build:electron
```

El instalador se generará en la carpeta `dist/`.

## 📦 Estructura del Proyecto

- `/electron`: Código del proceso principal (Main Process).
- `/src`: Código del frontend (Renderer Process).
- `/dist`: Archivos compilados y ejecutables.
ECHO POR WILMERWASS