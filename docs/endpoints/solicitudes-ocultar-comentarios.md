# API de Gestión de Comentarios Reportados

Este documento describe los endpoints disponibles para gestionar los comentarios reportados en la plataforma. Las rutas están protegidas y requieren autenticación con JWT.

## Base URL

Todas las rutas están prefijadas con `/api/`.

## Autenticación

Todas las rutas requieren un token JWT en el header `Authorization`:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Reportar Comentario (Propietario)

Permite a un propietario reportar un comentario para su revisión.

- **URL**: `/propietario/comentario/:comentarioid/reporte`
- **Método**: `POST`
- **Roles permitidos**: `3` (Propietario)
- **Body**:
  ```json
  {
    "motivo_reporte": "Motivo del reporte"
  }
  ```

**Respuestas**:

- **200 OK** - Reporte creado exitosamente:
  ```json
  {
    "mensaje": "Reporte registrado correctamente",
    "solicitud": {
      "id": 1,
      "comentarioid": 5,
      "motivo_reporte": "Contenido inapropiado",
      "estado": "pendiente"
    }
  }
  ```

- **400 Bad Request** - Datos inválidos o faltantes
- **403 Forbidden** - Usuario no autorizado
- **404 Not Found** - Comentario no encontrado

### 2. Listar Comentarios Reportados (Admin/Moderador)

Obtiene la lista de comentarios reportados pendientes de revisión.

- **URL**: `/administracion/comentarios/reportados`
- **Método**: `GET`
- **Roles permitidos**: `1` (Admin), `2` (Moderador)

**Respuesta exitosa (200 OK):**
```json
{
  "comentarios": [
    {
      "id": 17,
      "contenido": "Contenido del comentario",
      "estado": true,
      "aprobacion": 0,
      "motivo_reporte": "Motivo del reporte",
      "fecha_creacion": "2025-06-24T05:58:52.000Z",
      "usuario": {
        "id": 4,
        "nombre": "Usuario",
        "correo": "usuario@ejemplo.com"
      },
      "evento": {
        "nombre": "Nombre del Evento"
      }
    }
  ]
}
```

### 3. Obtener Detalle de Comentario (Super Admin / Admin)

Obtiene el detalle completo de un comentario reportado, incluyendo información del propietario que lo reportó y el estado actual del comentario.

- **URL**: `/administracion/comentario/:comentarioid`
- **Método**: `GET`
- **Roles permitidos**: `1` (Super Admin), `2` (Admin)

**Nota sobre el estado de aprobación**:
- Si `aprobacion` es `2`: El comentario está activo y visible para los usuarios.
- Si `aprobacion` es `1`: El comentario está inactivo (oculto) para los usuarios.
- Si `aprobacion` es `0`: El comentario está pendiente de revisión.

**Parámetros de URL**:
- `comentarioid` (requerido): ID del comentario a consultar

**Respuesta exitosa (200 OK):**
```json
{
  "mensaje": "Comentario reportado por: Juan Pérez, correo: juan@ejemplo.com",
  "estado": "Comentario activo (visible)",
  "datos": {
    "comentario": {
      "id": 17,
      "contenido": "Contenido del comentario",
      "estado": true,
      "aprobacion": 2,
      "estado_aprobacion": "Comentario activo (visible)",
      "motivo_reporte": "Motivo del reporte",
      "fecha_creacion": "2025-06-24T12:00:00.000Z",
      "fecha_actualizacion": "2025-06-24T12:00:00.000Z",
      "usuario": {
        "id": 1,
        "nombre": "Usuario",
        "correo": "usuario@ejemplo.com"
      },
      "evento": {
        "nombre": "Nombre del evento",
        "lugar": {
          "nombre": "Nombre del lugar",
          "propietario": {
            "nombre": "Juan Pérez",
            "correo": "juan@ejemplo.com"
          }
        }
      }
    }
  }
}
```

**Campos de estado en la respuesta:**
- `estado` (nivel raíz): Descripción textual del estado actual del comentario
- `datos.comentario.aprobacion`: Valor numérico del estado (0, 1 o 2)
- `datos.comentario.estado_aprobacion`: Descripción textual del estado

**Posibles valores de estado:**
- `0` / `"Pendiente de revisión"`: El comentario está pendiente de revisión por un administrador
- `1` / `"Comentario inactivo (oculto)"`: El comentario ha sido ocultado por un administrador
- `2` / `"Comentario activo (visible)"`: El comentario está visible para todos los usuarios

**Error cuando el comentario no existe (404 Not Found):**
```json
{
  "mensaje": "No hay comentario disponible con el ID proporcionado",
  "datos": null
}
```

**Códigos de estado HTTP:**
- `200`: Comentario encontrado exitosamente
- `401`: No autorizado (token inválido o faltante)
- `403`: No tiene permisos para ver este comentario
- `404`: Comentario no encontrado
- `500`: Error interno del servidor

### 4. Procesar Comentario Reportado (Super admin / Admin)

Permite aprobar o rechazar un comentario reportado.

- **URL**: `/administracion/procesar/:comentarioid`
- **Método**: `PUT`
- **Roles permitidos**: `1` (Admin), `2` (Moderador)
- **Body**:
  ```json
  {
    "decision": 1
  }
  ```
  - `decision`: `1` para aprobar/ocultar, `2` para rechazar/mantener visible

**Respuestas**:

- **200 OK** - Procesamiento exitoso:
  ```json
  {
    "mensaje": "Comentario aprobado y ocultado correctamente",
    "exito": true,
    "datos": {
      "comentario": {
        "id": 17,
        "contenido": "Contenido del comentario",
        "estado": false,
        "aprobacion": 1,
        "motivo_reporte": "Motivo del reporte",
        "fecha_creacion": "2025-06-24T05:58:52.000Z",
        "fecha_actualizacion": "2025-06-24T07:23:10.000Z",
        "usuario": {
          "id": 4,
          "nombre": "Usuario",
          "correo": "usuario@ejemplo.com"
        },
        "evento": {
          "nombre": "Nombre del Evento",
          "lugar": {
            "nombre": "Nombre del Lugar"
          }
        }
      },
      "procesadoPor": {
        "nombre": "Admin",
        "correo": "admin@ejemplo.com"
      }
    }
  }
  ```

- **400 Bad Request** - Decisión inválida o comentario ya procesado
- **403 Forbidden** - Usuario no autorizado
- **404 Not Found** - Comentario no encontrado

## Códigos de Estado

- `200 OK`: La solicitud se completó exitosamente
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No tiene permisos para realizar esta acción
- `404 Not Found`: El recurso solicitado no existe
- `500 Internal Server Error`: Error del servidor

## Notas

- Los comentarios tienen los siguientes estados:
  - `estado`: `true` (visible), `false` (oculto)
  - `aprobacion`: 
    - `0`: Pendiente de revisión
    - `1`: Aprobado (oculto)
    - `2`: Rechazado (visible)
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