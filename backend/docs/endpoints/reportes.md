# API de Gestión de Reportes y Moderación

Este documento describe los endpoints disponibles para gestionar reportes, lugares pendientes y notificaciones del sistema. Estas rutas están protegidas y requieren autenticación de administradores o moderadores.

## Base URL

Todas las rutas están prefijadas con `/api/reportes`.

## Endpoints

### 1. Actualizar Estado de Reporte de Comentario

Permite a un administrador o moderador actualizar el estado de un reporte de comentario.

- **URL**: `/comentario/:id/estado`
- **Método**: `PUT`
- **Parámetros de URL**:
  - `id` (requerido): ID del reporte de comentario
- **Autenticación requerida**: Sí
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)
- **Body (JSON)**:
  ```json
  {
    "estado": "aprobado",  // o "rechazado"
    "comentario_moderacion": "Comentario opcional del moderador"
  }
  ```

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "mensaje": "Estado del reporte actualizado correctamente",
  "reporte": {
    "id": 1,
    "estado": "aprobado",
    "comentario_moderacion": "Comentario ofensivo verificado"
  }
}
```

### 2. Listar Lugares Pendientes

Obtiene la lista de lugares que están pendientes de aprobación.

- **URL**: `/lugares/pendientes`
- **Método**: `GET`
- **Autenticación requerida**: Sí
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)
- **Parámetros de consulta opcionales**:
  - `pagina`: Número de página (por defecto: 1)
  - `porPagina`: Cantidad de resultados por página (por defecto: 10)

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "lugares": [
    {
      "id": 1,
      "nombre": "Nombre del Lugar",
      "descripcion": "Descripción del lugar pendiente de aprobación",
      "usuario": {
        "id": 3,
        "nombre": "Nombre del Propietario"
      },
      "fecha_solicitud": "2025-06-23T10:00:00.000Z"
    }
  ],
  "total": 1,
  "paginasTotales": 1,
  "paginaActual": 1
}
```

### 3. Actualizar Estado de Lugar

Permite a un administrador o moderador aprobar o rechazar un lugar pendiente.

- **URL**: `/lugar/:id/estado`
- **Método**: `PUT`
- **Parámetros de URL**:
  - `id` (requerido): ID del lugar
- **Autenticación requerida**: Sí
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)
- **Body (JSON)**:
  ```json
  {
    "estado": "aprobado",  // o "rechazado"
    "comentario_moderacion": "Comentario opcional del moderador"
  }
  ```

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "mensaje": "Estado del lugar actualizado correctamente",
  "lugar": {
    "id": 1,
    "nombre": "Nombre del Lugar",
    "estado": "aprobado"
  }
}
```

### 4. Obtener Notificaciones de Reportes

Obtiene las notificaciones de reportes de comentarios pendientes de revisión.

- **URL**: `/comentario/reportes/notificaciones`
- **Método**: `GET`
- **Autenticación requerida**: Sí
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "notificaciones": [
    {
      "id": 1,
      "tipo": "reporte_comentario",
      "mensaje": "Tienes 5 reportes de comentarios pendientes",
      "leido": false,
      "fecha_creacion": "2025-06-23T15:30:00.000Z"
    }
  ]
}
```

### 5. Obtener Notificaciones de Lugares

Obtiene las notificaciones de lugares pendientes de revisión.

- **URL**: `/lugares/creacion/notificaciones`
- **Método**: `GET`
- **Autenticación requerida**: Sí
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "notificaciones": [
    {
      "id": 2,
      "tipo": "nuevo_lugar",
      "mensaje": "Hay 3 lugares pendientes de revisión",
      "leido": false,
      "fecha_creacion": "2025-06-23T16:00:00.000Z"
    }
  ]
}
```

## Códigos de Estado HTTP

- `200 OK`: La solicitud se procesó correctamente
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No tiene permisos para realizar esta acción
- `404 Not Found`: El recurso solicitado no existe
- `500 Internal Server Error`: Error en el servidor

## Notas Adicionales

- Todas las rutas requieren autenticación mediante JWT.
- Solo usuarios con rol de administrador (1) o moderador (2) pueden acceder a estos endpoints.
- Los cambios realizados a través de estos endpoints deben ser registrados en el sistema de auditoría.
- Las notificaciones pueden ser marcadas como leídas una vez revisadas.
