
# Guía Visual y Estructural de la Aplicación AGECO CRM

Este documento describe la estructura visual, el diseño y los componentes de cada pantalla principal de la aplicación. Está diseñado para ser utilizado como una guía de referencia para la reconstrucción de la interfaz de usuario.

---

### **1. Pantalla de Inicio de Sesión**

*   **Imagen de Referencia**: `guia img - login.png`
*   **Ruta**: `/login`
*   **Descripción General**: Es una página minimalista con un formulario centrado, diseñado para la autenticación del usuario.

*   **Estructura Visual**:
    *   **Contenedor Principal**: Un `div` que ocupa toda la pantalla (`min-h-screen`) con un color de fondo (`bg-background`). Los elementos están centrados vertical y horizontalmente.
    *   **Tarjeta de Formulario**: Un componente `Card` de ShadCN, con un ancho máximo (`max-w-sm`), que contiene todos los elementos del formulario.
        *   **Encabezado (`CardHeader`)**:
            *   **Título (`CardTitle`)**: "AGECO CRM", en texto grande y negrita.
            *   **Descripción (`CardDescription`)**: "Ingrese sus credenciales para acceder al sistema.", en texto más pequeño y de color tenue.
        *   **Contenido (`CardContent`)**:
            *   **Campo 1 (Email)**: Una `Label` con el texto "Correo Electrónico" sobre un componente `Input` de tipo `email` con el placeholder "m@example.com".
            *   **Campo 2 (Contraseña)**: Una `Label` con el texto "Contraseña" sobre un `Input` de tipo `password`.
        *   **Pie de Página (`CardFooter`)**:
            *   **Botón (`Button`)**: Un único botón con el texto "Iniciar Sesión". Ocupa todo el ancho. Cuando está en estado de carga, muestra un ícono giratorio (`Loader2`) a la izquierda del texto.

---

### **2. Informe General (Dashboard)**

*   **Imagen de Referencia**: `guia img - informe.png`
*   **Ruta**: `/dashboard`
*   **Descripción General**: Es la página principal después de iniciar sesión. Muestra un resumen de alto nivel de la actividad de los clientes, dividido en períodos de tiempo.

*   **Estructura Visual**:
    *   **Título Principal**: "Informe General" con una descripción debajo.
    *   **Sección 1: KPIs por Período**:
        *   Un componente `Tabs` con cuatro pestañas (`TabsTrigger`): "Hoy", "Esta Semana", "Este Mes", "Total".
        *   Dentro de cada `TabsContent`, hay una cuadrícula (`grid`) con tres `KpiCard`:
            *   **KPI 1**: Título "Nuevos Clientes", valor numérico y un ícono de `UserPlus`.
            *   **KPI 2**: Título "Pólizas Activas", valor numérico y un ícono de `ShieldCheck`.
            *   **KPI 3**: Título "Gestiones Pendientes", valor numérico y un ícono de `AlertTriangle`.
    *   **Sección 2: Desglose de Clientes**:
        *   Una `Card` grande con el título "Desglose de Clientes".
        *   Dentro de la tarjeta, otro componente `Tabs` con las mismas cuatro pestañas: "Hoy", "Semana", "Mes", "Total".
        *   Dentro de cada `TabsContent`, hay una cuadrícula de dos columnas que contiene dos tablas:
            *   **Tabla 1**: "Clientes por Asesor". Muestra una lista de nombres de asesores y la cantidad de clientes que han registrado.
            *   **Tabla 2**: "Clientes por Estado". Muestra una lista de estados de EE.UU. y la cantidad de clientes registrados en cada uno.

---

### **3. Gestión de Clientes**

*   **Imagen de Referencia**: `guia img - clientes.png`
*   **Ruta**: `/dashboard/clients`
*   **Descripción General**: La sección principal para administrar la lista de todos los clientes.

*   **Estructura Visual**:
    *   **Encabezado de Página**: Un título "Gestión de Clientes" y un botón "Añadir Cliente" a la derecha (con un ícono `PlusCircle`).
    *   **Controles de Tabla**:
        *   Un campo `Input` a la izquierda para "Filtrar por nombre...".
    *   **Tabla de Datos (`ClientTable`)**:
        *   Una tabla que lista los clientes con las siguientes columnas: Checkbox, Nombre Completo, Teléfono, Estado, Compañía de Seguro, Estatus, Asesor, Última Actualización, Acciones.
        *   La columna "Nombre Completo" es un enlace que abre el formulario del cliente.
        *   La columna "Estatus" muestra una `Badge` de color que varía según el estado de la póliza (ej. verde para "Activa", rojo claro para "GESTION NECESARIA").
        *   La columna "Acciones" contiene un botón "Ver" y un menú de tres puntos (`MoreHorizontal`) con opciones para "Editar" y "Borrar".
        *   Las filas con estatus "GESTION NECESARIA" tienen un fondo de color rojo claro.
    *   **Paginación**: Debajo de la tabla, se muestran los controles para ir a la "Anterior" y "Siguiente" página, y un texto que indica cuántas filas están seleccionadas.

---

### **4. Formulario de Clientes (Panel Lateral)**

*   **Imagen de Referencia**: `guia img - formulario clientes.png`
*   **Componente**: `ClientForm` (se muestra como un `Sheet` o panel deslizable)
*   **Descripción General**: Un formulario extenso que se abre desde la derecha para crear, ver o editar un cliente.

*   **Estructura Visual**:
    *   **Contenedor Principal**: Un `Sheet` que ocupa gran parte de la pantalla.
    *   **Encabezado del Sheet**: Un `SheetTitle` (ej. "Añadir Nuevo Cliente") y una `SheetDescription`.
    *   **Pestañas (`Tabs`)**: El formulario está organizado en 5 pestañas:
        1.  **Personal**: Captura datos como nombre, edad, fecha de nacimiento (con un `Calendar` emergente), SSN, contacto, dirección, etc.
        2.  **Grupo Familiar**: Campos para `dependientes`, `# Miembros` y un `Textarea` para la información de los dependientes.
        3.  **Seguro**: Campos para `Compañía de Seguro`, `Nombre del Plan`, `ID del Plan`, `Prima Mensual` y `Link del Plan`.
        4.  **Método de Pago**: Dos secciones colapsables (`Accordion`) para "Cuentas Bancarias" y "Tarjetas de Crédito/Débito", con la capacidad de añadir y eliminar dinámicamente.
        5.  **Seguimiento**: Contiene el estatus de la póliza, un historial de gestiones (mostrado como un chat), y otros campos de seguimiento administrativo.
    *   **Pie de Página del Sheet (`SheetFooter`)**:
        *   A la izquierda, un botón "Copiar Info" con un ícono `Copy`.
        *   A la derecha, los botones principales de acción que cambian según el modo: "Cancelar" y "Guardar Cliente" (en modo edición/creación) o "Cerrar" y "Editar Cliente" (en modo solo lectura).

---

### **5. AG.ES.COM (Agentes Disponibles)**

*   **Imagen de Referencia**: `guia img - agescom.png`
*   **Ruta**: `/dashboard/agents`
*   **Descripción General**: Página para gestionar una lista de agentes externos, con una potente funcionalidad de filtrado.

*   **Estructura Visual**:
    *   **Encabezado de Página**: Título "AG.ES.COM" y botón "Añadir Agente" (solo para administradores).
    *   **Tarjeta de Filtros (`Card`)**:
        *   Título "Filtrar Agentes".
        *   Una cuadrícula con tres menús desplegables (`Select`) para "Agente", "Estado" y "Compañía".
        *   Un botón "Limpiar Filtros" con un ícono `FilterX`.
    *   **Tabla de Agentes**:
        *   Una `Card` que envuelve una `Table`.
        *   Columnas: "Agente", "Estado", "Compañía", y "Acciones" (con íconos `Edit` y `Trash` para administradores).

---

### **6. Avisos y Gestiones**

*   **Imagen de Referencia**: `guia img - avisos.png`
*   **Ruta**: `/dashboard/notifications`
*   **Descripción General**: Muestra una lista de notificaciones o tareas pendientes para el usuario y permite la creación de nuevos avisos.

*   **Estructura Visual**:
    *   **Encabezado de Página**: Título "Avisos y Gestiones" y un botón "Crear Aviso" a la derecha (con un ícono `PlusCircle`).
    *   **Formulario de Creación de Avisos (Modal o Panel Deslizable)**:
        *   Aparece al presionar "Crear Aviso". Contiene los siguientes campos:
        *   **Tipo de Aviso**: Un `RadioGroup` para seleccionar "Aviso sobre Cliente" o "Aviso General".
        *   **Buscar Cliente**: Un `Input` con búsqueda autocompletada para seleccionar un cliente (visible solo si el tipo es "Aviso sobre Cliente").
        *   **Destinatario**: Un `Select` para dirigir el aviso a "Todos" o a un asesor específico.
        *   **Mensaje**: Un `Textarea` para el contenido del aviso.
        *   **Pie de Formulario**: Botones para "Cancelar" y "Guardar Aviso".
    *   **Lista de Avisos**:
        *   Una lista vertical de componentes `Card`. Cada tarjeta representa un aviso.
        *   **Contenido de la Tarjeta**:
            *   Título (`CardTitle`): El nombre del cliente relacionado o "Aviso General".
            *   Descripción (`CardDescription`): El texto de la nota/aviso.
            *   Insignia (`Badge`): Una insignia en la esquina superior derecha que indica el estado: "Pendiente" (amarillo) o "Visto" (verde).
            *   Pie de Página (`CardFooter`):
                *   Muestra la fecha, quién creó el aviso y para quién es.
                *   Botones de acción: "Ir a Gestión" (con ícono `ArrowRight`), "Marcar Visto" (con ícono `Check`) y "Reabrir" (con ícono `Undo2`).

---

### **7. Enlaces Directos**

*   **Imagen de Referencia**: `guia img - enlaces.png`
*   **Ruta**: `/dashboard/links`
*   **Descripción General**: Una página sencilla que muestra una colección de enlaces útiles.

*   **Estructura Visual**:
    *   **Encabezado de Página**: Título "Enlaces Directos" y botón "Añadir Enlace" (solo para administradores).
    *   **Cuadrícula de Enlaces**:
        *   Una `grid` que muestra varias `Card`.
        *   **Contenido de cada Tarjeta**:
            *   El nombre del enlace como título.
            *   La URL del enlace como descripción.
            *   Botones de acción: "Visitar" (con ícono `ExternalLink`), y para administradores, "Editar" y "Borrar".

---

### **8. Perfil y Gestión de Usuarios**

*   **Imagen de Referencia**: `guia img - perfil.png`
*   **Ruta**: `/dashboard/profile`
*   **Descripción General**: Permite al usuario ver su perfil. Los administradores ven una sección adicional para gestionar a todos los usuarios del sistema.

*   **Estructura Visual**:
    *   **Sección 1: Tarjeta de Perfil**:
        *   Una `Card` con el título "Perfil de Usuario".
        *   Contiene el `Avatar` del usuario, su nombre completo, email y una `Badge` con su rol ("admin" o "asesor").
        *   Hay botones para "Cambiar" la foto de perfil y un menú de configuración (`Settings`) para "Cambiar Contraseña".
    *   **Sección 2: Gestión de Usuarios (solo Admin)**:
        *   Un separador (`Separator`).
        *   Título "Usuarios del Sistema" y botón "Añadir Usuario".
        *   Un campo `Input` para filtrar usuarios.
        *   Una tabla que lista a todos los usuarios con las columnas: Nombre, Correo Electrónico, Rol y Estatus.
        *   Cada fila tiene un menú de acciones para "Editar" (con ícono `Edit`), "Bloquear/Activar" (con ícono `Ban`) y "Borrar" (con ícono `Trash`) al usuario.
