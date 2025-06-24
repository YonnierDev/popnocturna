# API de Gestión de Solicitudes de Ocultar Comentarios

Este documento describe los endpoints disponibles para gestionar las solicitudes de ocultar comentarios en la plataforma. Estas rutas están protegidas y requieren autenticación.

## Base URL

Todas las rutas están prefijadas con `/api/`.

## Endpoints

### 1. Obtener Solicitudes Pendientes (Admin/Moderador)

Obtiene la lista de solicitudes de ocultar comentarios pendientes de revisión.

- **URL**: `/administracion/pendientes`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Administradores y Moderadores)
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "solicitudes": [
    {
      "id": 1,
      "comentarioid": 5,
      "usuarioid": 3,
      "motivo": "Contenido inapropiado",
      "estado": "pendiente",
      "fecha_solicitud": "2025-06-23T15:30:00.000Z"
    }
  ]
}
```

### 2. Obtener Detalle de Solicitud (Admin/Moderador)

Obtiene el detalle completo de una solicitud de ocultar comentario, incluyendo información del comentario y del usuario que lo reportó.

- **URL**: `/administracion/detalle/:comentarioid`
- **Método**: `GET`
- **Parámetros de URL**:
  - `comentarioid` (requerido): ID del comentario
- **Autenticación requerida**: Sí (Administradores y Moderadores)
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "solicitud": {
    "id": 1,
    "comentario": {
      "id": 5,
      "contenido": "Comentario ofensivo...",
      "fecha_hora": "2025-06-22T14:30:00.000Z",
      "usuario": {
        "id": 2,
        "nombre": "Usuario Común"
      }
    },
    "usuario_solicitante": {
      "id": 3,
      "nombre": "Usuario que reportó"
    },
    "motivo": "Contenido inapropiado",
    "estado": "pendiente",
    "fecha_solicitud": "2025-06-23T15:30:00.000Z"
  }
}
```

### 3. Procesar Solicitud (Admin/Moderador)

Permite a un administrador o moderador aprobar o rechazar una solicitud de ocultar comentario.

- **URL**: `/administracion/procesar/:comentarioid`
- **Método**: `PUT`
- **Parámetros de URL**:
  - `comentarioid` (requerido): ID del comentario
- **Autenticación requerida**: Sí (Administradores y Moderadores)
- **Permisos requeridos**: `Rol 1` (Admin) o `Rol 2` (Moderador)
- **Body (JSON)**:
  ```json
  {
    "accion": "aprobar", // o "rechazar"
    "comentario_moderacion": "Comentario opcional del moderador"
  }
  ```

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "mensaje": "Solicitud procesada exitosamente",
  "comentario": {
    "id": 5,
    "estado": false,
    "motivo_oculto": "Contenido inapropiado"
  }
}
```

## Códigos de Estado HTTP

- `200 OK`: La solicitud se procesó correctamente
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No tiene permisos para realizar esta acción
- `404 Not Found`: El comentario o la solicitud no existe
- `500 Internal Server Error`: Error en el servidor

## Notas Adicionales

- Las solicitudes de ocultar comentarios solo pueden ser creadas por usuarios autenticados.
- Solo los administradores (rol 1) y moderadores (rol 2) pueden ver y procesar las solicitudes.
- Al aprobar una solicitud, el comentario se marca como oculto y ya no será visible para los usuarios estándar.
- Los usuarios que creen múltiples solicitudes falsas pueden ser sancionados.

### 4. Solicitar Ocultar Comentario (Propietario)

Permite a un propietario solicitar que se oculte un comentario de su establecimiento.

- **URL**: `/propietario/comentario/:comentarioid/reporte`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Propietarios)
- **Roles permitidos**: `3` (Propietario)

**Parámetros de URL**:
- `comentarioid` (requerido): ID del comentario a reportar

**Body (JSON)**:
```json
{
  "motivo": "Motivo por el cual se solicita ocultar el comentario"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "mensaje": "Solicitud registrada exitosamente",
  "solicitud": {
    "id": 1,
    "comentarioid": 5,
    "estado": "pendiente",
    "fecha_solicitud": "2025-06-23T15:30:00.000Z"
  }
}
```

**Errores posibles:**
- 400: Ya existe una solicitud pendiente para este comentario
- 401: No autenticado
- 403: No autorizado (usuario no es propietario del establecimiento)
- 404: Comentario no encontrado
- 500: Error del servidor
}