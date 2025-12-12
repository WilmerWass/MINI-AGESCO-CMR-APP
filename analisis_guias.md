# Análisis de Guías Visuales para la Renovación del CRM

Este documento desglosa las funcionalidades y propuestas de diseño basadas en las imágenes de referencia encontradas en la carpeta `/GUIAS`. El objetivo es replicar la funcionalidad útil de las referencias pero con un diseño propio, adaptado al ecosistema de Material-UI y al estilo visual de la aplicación actual.

---

### 1. **Visión General y Navegación**

*   **Imágenes de Referencia:**
    *   `barra lateral.png`
    *   `pantalla de inicio o principal.png`
    *   `vista de cliente en pantalla de inicio.png`

*   **Funcionalidad Propuesta:**
    *   **Dashboard Centralizado:** La pantalla de inicio debe actuar como un dashboard que presente información clave de un vistazo:
        *   KPIs principales (Nuevos clientes, Pólizas activas, Gestiones pendientes).
        *   Una lista de "clientes vistos recientemente" o "clientes con actividad reciente".
        *   Una sección de "recordatorios" o "tareas pendientes".
    *   **Barra Lateral de Navegación:** El menú lateral debe ser el principal medio de navegación. Debe ser colapsable para maximizar el espacio de trabajo y contener iconos claros para cada módulo (Inicio, Clientes, Agentes, Informes, etc.).

*   **Propuesta de Diseño (Adaptado):**
    *   Utilizar el componente `Drawer` de Material-UI en su modo `permanent` o `persistent` para la barra lateral, permitiendo que se oculte en pantallas más pequeñas.
    *   El dashboard se puede construir usando un `Grid` de Material-UI, con componentes `Card` para cada sección (KPIs, Clientes Recientes, Tareas).
    *   Los KPIs pueden ser componentes `Paper` con `Typography` y `Icon`.
    *   La lista de clientes en el dashboard puede ser una `List` simple de Material-UI o una `Table` simplificada.

---

### 2. **Vista Detallada del Cliente (El Corazón del CRM)**

*   **Imágenes de Referencia:**
    *   `vista dentro de un cliente con barra lateral ampliada.png`
    *   `vista dentro de un cliente con barra lateral cerrada.png`
    *   `barra del cliente - resumen de poliza.png`
    *   `barra del cliente - informacion del hogar.png`
    *   `sesion de direcciones.png`
    *   `sesion de pagos informacion.png`
    *   `sesion miembros de la familia.png`
    *   `vista Informacion del seguro.png`

*   **Funcionalidad Propuesta:**
    *   Crear una nueva "Vista de Detalle del Cliente" que consolide toda la información en un solo lugar.
    *   **Resumen Fijo:** Una sección superior con la información más crítica siempre visible: Nombre, Teléfono, Email, Estatus de la póliza.
    *   **Navegación por Pestañas (Tabs):** Organizar la información detallada en pestañas para no saturar la pantalla. Las pestañas podrían ser:
        1.  **Resumen:** Contiene la información de la póliza, primas, ahorros, etc.
        2.  **Información Personal:** Datos demográficos, SSN, estatus migratorio, direcciones.
        3.  **Grupo Familiar:** Una tabla o lista para añadir, ver y editar miembros de la familia y dependientes.
        4.  **Pagos:** Información de tarjetas de crédito/cuentas bancarias y un historial de pagos.
        5.  **Documentos:** (Ver sección 4)
        6.  **Seguimiento/Notas:** (Ver sección 5)

*   **Propuesta de Diseño (Adaptado):**
    *   La vista principal será una página a la que se navega al hacer clic en un cliente.
    *   La sección de resumen puede ser un componente `Card` o `Paper` en la parte superior.
    *   Usar el componente `Tabs` de Material-UI para organizar el contenido detallado. Cada pestaña renderizará un componente diferente.
    *   Los formularios dentro de cada pestaña usarán componentes estándar de Material-UI (`TextField`, `Select`, `DatePicker`).
    *   La información de los miembros de la familia se puede gestionar con una `Table` de Material-UI, con botones de acción en cada fila (editar, eliminar).

---

### 3. **Gestión de Contactos y Módulos Relacionados**

*   **Imágenes de Referencia:**
    *   `vista en contactos.png`
    *   `vista en cotizaciones.png`
    *   `vista en sms y WhatsApp .png`

*   **Funcionalidad Propuesta:**
    *   **Módulo de Contactos:** Centralizar la lista de todos los clientes en una tabla avanzada.
        *   Funcionalidades de búsqueda y filtrado potente.
        *   Acciones rápidas desde la tabla (llamar, enviar email/SMS).
    *   **Módulo de Cotizaciones:** Un lugar para crear, gestionar y enviar cotizaciones a los clientes. Cada cotización debe estar vinculada a un cliente.
    *   **Integración de Comunicación:** Aunque una integración real con SMS/WhatsApp es compleja, podemos simularla creando un módulo donde se registren las comunicaciones enviadas, con plantillas predefinidas.

*   **Propuesta de Diseño (Adaptado):**
    *   El módulo de contactos es una evolución de la `ClientTable` actual. Se pueden añadir más filtros y un `TextField` de búsqueda rápida.
    *   Para el módulo de cotizaciones, se puede crear un nuevo formulario para generar la cotización y una tabla para listar las existentes.
    *   Para la comunicación, se puede usar un `Modal` o una página nueva donde el asesor elija una plantilla, vea el mensaje renderizado y lo marque como "enviado", creando un registro en el historial del cliente.

---

### 4. **Gestión de Documentos y Firmas**

*   **Imágenes de Referencia:**
    *   `vista desde documentos.png`
    *   `vista formularios de firmas.png`

*   **Funcionalidad Propuesta:**
    *   **Repositorio de Documentos por Cliente:** En la ficha del cliente (en una nueva pestaña "Documentos"), permitir la subida de archivos (PDF, imágenes).
    *   Los archivos subidos se deben poder previsualizar y descargar.
    *   **Gestión de Formularios:** Crear una sección donde se puedan listar formularios estándar (ej. "Autorización de Divulgación de Información"). El estado de estos formularios (pendiente, firmado) debe ser visible.

*   **Propuesta de Diseño (Adaptado):**
    *   Para la subida de archivos, se puede implementar un área de "drag and drop" o un simple botón de "subir archivo" que abra el explorador de archivos.
    *   Los documentos listados pueden usar un componente `ImageList` o una `Table` de Material-UI, con botones para `Descargar` y `Eliminar`.
    *   El estado de los formularios se puede gestionar con `Chip` de Material-UI con colores (ej. rojo para "pendiente", verde para "firmado").

---

### 5. **Seguimiento, Notas y Recordatorios**

*   **Imágenes de Referencia:**
    *   `notas o mensajes.png`
    *   `sesion de seguimientos.png`
    *   `vista recordatorios.png`

*   **Funcionalidad Propuesta:**
    *   **Sistema de Notas Avanzado:** El sistema de "Avisos" actual puede evolucionar a un sistema de "Notas" o "Actividades".
        *   Cada nota debe estar vinculada a un cliente.
        *   Se debe poder categorizar cada nota (Llamada, Email, Reunión, Seguimiento).
        *   Las notas deben mostrarse en un historial cronológico en la ficha del cliente.
    *   **Módulo de Recordatorios:** Una página global y una sección en el dashboard donde se listen los recordatorios (ej. "Llamar a Juan Pérez para renovación", "Cumpleaños de María García").
    *   Los recordatorios deben tener una fecha y un estado (pendiente/completado).

*   **Propuesta de Diseño (Adaptado):**
    *   En la ficha del cliente, la pestaña "Seguimiento" puede mostrar una línea de tiempo (timeline) usando el componente `Timeline` de `@mui/lab` para un efecto visual atractivo.
    *   El formulario para añadir una nota puede ser un `Modal` simple con un `TextField` para el contenido y un `Select` para la categoría.
    *   La página de Recordatorios puede usar una `Table` o una `List` para mostrar los recordatorios, con la opción de marcarlos como completados.

---

Este análisis servirá de base para la creación del `plan_de_desarrollo_detallado.md`.
