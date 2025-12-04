# Estado del Proyecto y Futuras Mejoras

## Estado Actual (Versión 1.0.0)

La aplicación se encuentra en un estado **funcional y estable**. Se han completado las siguientes funcionalidades y correcciones:

### Funcionalidad Base
- **Autenticación y Sesiones:** Sistema de login funcional con persistencia de sesión y roles (admin/asesor). Creación de un superusuario `admin` garantizada en la primera ejecución.
- **CRUD de Clientes:** La gestión de clientes está completamente conectada a la base de datos.
- **CRUD de Agentes:** La gestión de agentes ("AG.ES.COM") es funcional y está conectada a la base de datos.
- **CRUD de Usuarios:** Los administradores pueden crear, editar (incluyendo reseteo de contraseña) y eliminar otros usuarios.
- **Sistema de Avisos:** Funcionalidad de creación y visualización de avisos conectada a la base de datos.
- **Página de Perfil:** Permite la edición de datos básicos (nombre, avatar) y el cambio de contraseña (solo para administradores).

### Reglas de Negocio Implementadas
- Los asesores solo ven los datos (clientes, avisos) asignados a ellos.
- Los administradores tienen una vista global de todos los datos.
- Un administrador no puede eliminar su propia cuenta.
- Un asesor no puede cambiar su propia contraseña.

## Futuras Mejoras y Tareas Pendientes

### Funcionales
- **Refactorizar `InformePage`:** La consulta del dashboard fue parchada para ser retrocompatible. Se debería crear un script de migración para actualizar todos los `asesorId` antiguos a formato numérico y luego simplificar la consulta.
- **Implementar "Ir a Gestión":** El botón en las tarjetas de aviso debe navegar a la página de detalle del cliente correspondiente.
- **Filtros Avanzados:** Mejorar los filtros en las tablas para que sean más potentes (ej. filtrar por rango de fechas).
- **Exportación de Datos:** Añadir funcionalidad para exportar tablas (clientes, informes) a formatos como CSV o PDF.

### Visuales y de Usabilidad (UX)
- **Pulido General:** Realizar una revisión completa de la interfaz para unificar estilos, espaciados, y mejorar la experiencia de usuario.
- **Notificaciones/Alertas:** Usar un sistema de notificaciones más robusto y consistente en toda la aplicación en lugar de `alert()`.
- **Modo Oscuro/Claro:** Implementar un interruptor para cambiar entre temas de color.
- **Responsividad:** Asegurar que la interfaz se adapte correctamente a diferentes tamaños de ventana.

### Técnicas
- **Empaquetado y Distribución:** Configurar `electron-builder` para generar instaladores ejecutables para Windows, macOS y/o Linux.
- **Testing:** Implementar un framework de pruebas (como Vitest o Jest) para añadir pruebas unitarias y de integración, garantizando la estabilidad a largo plazo.
