# Plan de Desarrollo Detallado: Renovación del CRM

Este documento presenta una hoja de ruta completa para implementar las nuevas funcionalidades en el CRM, basadas en el `analisis_guias.md`. El objetivo es tener una planificación clara, minimizar riesgos y asegurar un desarrollo ordenado.

---

## 1. Mapa Conceptual de Nuevas Funcionalidades

El objetivo es evolucionar de un CRM básico a una plataforma centrada en una **Vista de Cliente 360°**.

```
[ CRM Principal ]
     |
     +--- [ Dashboard Interactivo ]
     |      |
     |      +--- KPIs Principales
     |      +--- Clientes Recientes
     |      +--- Recordatorios Globales
     |
     +--- [ Módulo de Clientes (Mejorado) ]
     |      |
     |      +--- Tabla de Clientes con Filtros Avanzados
     |      +--- [ Vista Detalle de Cliente 360° ]  <-- **NUEVO NÚCLEO**
     |             |
     |             +--- (Pestaña) Resumen de Póliza
     |             +--- (Pestaña) Información Personal y Direcciones
     |             +--- (Pestaña) Grupo Familiar (sub-tabla)
     |             +--- (Pestaña) Información de Pagos
     |             +--- (Pestaña) Repositorio de Documentos
     |             +--- (Pestaña) Historial de Seguimiento (Timeline)
     |
     +--- [ Módulo de Cotizaciones ] (Nuevo)
     |
     +--- [ Módulo de Recordatorios ] (Nuevo)
     |
     +--- [ Módulo de Comunicación (Registros) ] (Nuevo)
```

---

## 2. Trayectoria de Desarrollo (Fases)

Se propone un desarrollo incremental en 4 fases principales para gestionar la complejidad.

*   **Fase 1: El Corazón del CRM - La Vista de Detalle del Cliente.**
    *   **Objetivo:** Construir la nueva vista centralizada de cliente. Es la base sobre la que se construirán las demás funcionalidades.
*   **Fase 2: Módulos de Soporte - Documentos y Seguimiento.**
    *   **Objetivo:** Implementar la gestión de documentos y el historial de seguimiento dentro de la nueva vista de cliente.
*   **Fase 3: Funcionalidades Satélite - Cotizaciones y Recordatorios.**
    *   **Objetivo:** Crear los nuevos módulos independientes que se conectarán con los clientes.
*   **Fase 4: Pulido y Mejoras de UX.**
    *   **Objetivo:** Mejorar el dashboard, la navegación y la experiencia general de usuario con la información de los nuevos módulos.

---

## 3. Plan de Trabajo Detallado (Paso a Paso)

### **Fase 1: Vista de Detalle del Cliente**

1.  **Backend (Electron `main.ts` y `database.ts`):**
    *   [ ] Modificar el esquema/modelo del Cliente en la base de datos para incluir los nuevos campos (direcciones múltiples, información de póliza, etc.).
    *   [ ] Crear una función `getClienteDetalladoById(id)` que devuelva toda la información del cliente, incluyendo sus familiares, pagos, etc.
    *   [ ] Exponer esta nueva función a través del `preload.ts`.

2.  **Frontend (React):**
    *   [ ] Crear un nuevo componente de página: `src/ui/pages/ClientDetailPage.tsx`.
    *   [ ] Añadir la ruta `/dashboard/cliente/:id` en el sistema de enrutamiento para que apunte a esta nueva página.
    *   [ ] En `ClientDetailPage.tsx`, obtener el `id` de la URL y llamar a la nueva función `api.getClienteDetalladoById(id)`.
    *   [ ] Diseñar el componente `ResumenCliente` que mostrará la información superior fija.
    *   [ ] Implementar el componente `Tabs` de Material-UI.
    *   [ ] Crear los componentes para las primeras pestañas: `TabResumenPoliza.tsx`, `TabInfoPersonal.tsx`, `TabGrupoFamiliar.tsx`, `TabPagos.tsx`.
    *   [ ] Poblar estos componentes con los datos obtenidos del backend.

### **Fase 2: Documentos y Seguimiento**

1.  **Backend:**
    *   [ ] Diseñar el esquema de la base de datos para `Documentos` y `NotasDeSeguimiento`, ambos con una referencia al `clienteId`.
    *   [ ] Crear funciones CRUD para `Documentos` (subir, listar, eliminar). La "subida" guardará el archivo en una carpeta designada y la ruta en la BD.
    *   [ ] Crear funciones CRUD para `NotasDeSeguimiento`.
    *   [ ] Exponer las nuevas funciones a través del `preload.ts`.

2.  **Frontend:**
    *   [ ] Crear el componente `TabDocumentos.tsx`.
    *   [ ] Implementar la UI para subir archivos (área de drag-and-drop o botón).
    *   [ ] Mostrar los documentos en una tabla o lista, con botones de acción.
    *   [ ] Crear el componente `TabSeguimiento.tsx`.
    *   [ ] Implementar el componente `Timeline` de `@mui/lab` para mostrar las notas.
    *   [ ] Crear un `Modal` para añadir nuevas notas de seguimiento.

### **Fase 3: Cotizaciones y Recordatorios**

1.  **Backend:**
    *   [ ] Diseñar esquemas de BD para `Cotizaciones` y `Recordatorios`.
    *   [ ] Crear funciones CRUD para ambos y exponerlas en el `preload.ts`.

2.  **Frontend:**
    *   [ ] Crear la nueva página `src/ui/pages/CotizacionesPage.tsx` y añadirla al menú.
    *   [ ] Crear la nueva página `src/ui/pages/RecordatoriosPage.tsx` y añadirla al menú.
    *   [ ] Implementar las tablas y formularios necesarios para gestionar cotizaciones y recordatorios.

### **Fase 4: Pulido y Mejoras de UX**

1.  **Frontend:**
    *   [ ] Rediseñar el `Dashboard` (`InformePage.tsx`) para incluir un resumen de recordatorios pendientes o cotizaciones recientes.
    *   [ ] Asegurar que toda la navegación sea fluida e intuitiva.
    *   [ ] Aplicar un tema consistente de Material-UI (colores, espaciado, tipografía) en todos los nuevos componentes.
    *   [ ] Revisar la responsividad de las nuevas vistas.

---

## 4. Registro de Cambios (Plantilla)

Se utilizará este formato en los mensajes de commit y en un futuro `CHANGELOG.md`:

```
### Versión X.Y.Z (DD/MM/AAAA)

#### ✨ Nuevas Características
- **(Fase 1)** Creada la nueva Vista de Detalle de Cliente con navegación por pestañas.
- **(Fase 2)** Implementado el repositorio de documentos por cliente.

#### 🐛 Correcciones
- Corregido error que impedía mostrar correctamente el estatus de la póliza.

#### ⚡️ Mejoras
- Optimizado el tiempo de carga de la lista de clientes.
```

---

## 5. Sugerencias, Alertas y Recomendaciones

*   **⚠️ Alerta - Migración de Datos:**
    *   Al modificar la estructura de los `Clientes` en la base de datos, los clientes ya existentes no tendrán los nuevos campos. Se debe planificar cómo manejar esto: ¿se añadirán los campos vacíos la primera vez que se edite un cliente antiguo? ¿se creará un script de migración?

*   **💡 Sugerencia - Reutilización de Componentes:**
    *   Crear componentes genéricos siempre que sea posible. Por ejemplo, un componente `TablaGenerica` o `FormularioModal` se podría reutilizar en Clientes, Agentes, Cotizaciones, etc., para mantener la consistencia y reducir la duplicación de código.

*   **👍 Recomendación - Pruebas (Testing):**
    *   Se recomienda encarecidamente añadir pruebas unitarias para las nuevas funciones del backend (en `database.ts`). Esto es crucial para asegurar que la lógica de negocio es correcta y evitar regresiones. Herramientas como `Vitest` se integran bien con Vite.

*   **⚠️ Alerta - Manejo de Archivos:**
    *   La funcionalidad de subir archivos debe ser manejada con cuidado. Se debe definir una ubicación segura y organizada en el sistema de archivos del usuario para guardar los documentos, y asegurarse de que los nombres no colisionen.

*   **💡 Sugerencia - Gestión de Estado:**
    *   Para funcionalidades complejas, especialmente en formularios con muchos campos, considerar el uso de una librería de manejo de formularios como `react-hook-form` para simplificar la validación y el estado.
