# Seguimiento del Proyecto: MINI AGECO CRM

**PLANIFICACIÓN DETALLADA DISPONIBLE:** Para un desglose completo de las nuevas funcionalidades, propuestas de diseño y el plan de trabajo paso a paso, por favor consulta los siguientes documentos:

- **[Análisis de Guías Visuales](./analisis_guias.md)**
- **[Plan de Desarrollo Detallado](./plan_de_desarrollo_detallado.md)**

---

Este documento centraliza el estado del proyecto, las futuras implementaciones y los recursos necesarios para la renovación de la aplicación.

## Estado Actual del Proyecto (Versión 1.0.3 Beta)

La aplicación se encuentra en un estado **funcional y estable**, con las siguientes características principales completadas:

- **Autenticación y Roles:** Sistema de login robusto con roles (admin/asesor) y persistencia de sesión.
- **Módulos CRUD Completos:** Gestión de Clientes, Agentes, Usuarios y Avisos totalmente funcional y conectada a la base de datos MongoDB.
- **Sistema de Respaldo:** ✅ Implementada exportación/importación de datos (JSON/CSV).
- **Ejecutable de Escritorio:** ✅ Generación de instalador (`.exe`) con Electron Builder configurada y funcional.
- **Página de Perfil:** Edición de datos de usuario y cambio de contraseña.
- **Paginación y Mejoras de Rendimiento:** Implementada paginación en la tabla de clientes para un manejo eficiente de grandes volúmenes de datos.
- **Reglas de Negocio:** Implementada la lógica para que los asesores solo vean sus datos, mientras que los administradores tienen una vista global.

## Futuras Implementaciones

### 🔴 Alta Prioridad

1.  **Validación Avanzada de Formularios:** Implementar validación de campos requeridos, formatos (email, teléfono) y reglas de negocio en todos los formularios.
2.  **Sistema de Respaldo y Exportación:** ✅ COMPLETADO (v1.0.3).

### 🟡 Prioridad Media

- **Refactorización de Consultas:** Optimizar las consultas a la base de datos, especialmente en el dashboard.
- **Filtros Avanzados:** Mejorar la capacidad de filtrado en todas las tablas (ej. por rango de fechas).
- **Mejoras Visuales y de Usabilidad (UX):**
  - Realizar un pulido general de la interfaz.
  - Implementar un sistema de notificaciones consistente (ej. Snackbar).
  - Añadir un interruptor para **Modo Oscuro/Claro**.

### 🟢 Prioridad Baja

- **Empaquetado y Distribución:** ✅ COMPLETADO (v1.0.3).
- **Testing:** Implementar un framework de pruebas como Vitest o Jest.
- **Gestor Documental:** Permitir subir archivos (PDF, imágenes) a la ficha del cliente.
- **Integración con WhatsApp/Email:** Añadir botones de acción rápida con plantillas.
- **Sistema de Recordatorios:** Alertas para renovaciones y cumpleaños.

## Renovación de la Guía Visual del CRM

Se actualizará la carpeta `GUIAS/` con nuevas imágenes que servirán como referencia para el rediseño y la ampliación de la funcionalidad del CRM.

**Instrucción:** Por favor, renombra las nuevas imágenes de guía para que coincidan con los siguientes nombres de archivo para asegurar la consistencia:

- `guia_dashboard_principal.png`
- `guia_lista_clientes.png`
- `guia_detalle_cliente.png`
- `guia_crear_editar_cliente.png`
- `guia_lista_agentes.png`
- `guia_notificaciones.png`
- `guia_informes_y_estadisticas.png`
- `guia_exportar_datos.png`
- `guia_configuracion_perfil.png`
