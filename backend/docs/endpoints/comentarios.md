# Documentación de Endpoints - Comentarios

## Tabla de Contenidos
- [Endpoints para Aplicación Móvil (Rol 4)](#endpoints-para-aplicacion-movil)
- [Endpoints Administrativos](#endpoints-administrativos)

## Endpoints para Aplicación Móvil (Rol 4)

### `GET /api/comentarios`
**Obtener Comentarios**

- **Rol**: 4 (Aplicación Móvil)
- **Descripción**: Obtiene la lista de comentarios del usuario autenticado
- **Respuesta**: Lista de comentarios con detalles del evento y usuario

```json
{
  "mensaje": "Tus comentarios obtenidos exitosamente (Vista de Usuario)",
  "comentarios": [
    {
      "id": 1,
      "contenido": "Comentario de ejemplo",
      "estado": true,
      "aprobacion": 1,
      "fecha_hora": "2025-06-15T12:00:00.000Z",
      "usuario": {
        "id": 1,
        "nombre": "Usuario Ejemplo",
        "correo": "usuario@ejemplo.com"
      },
      "evento": {
        "id": 1,
        "nombre": "Evento de ejemplo"
      }
    }
  ]
}
```

### `GET /api/comentarios/evento/:eventoid`
**Obtener Comentarios por Evento**

- **Rol**: 4 (Aplicación Móvil)
- **Descripción**: Obtiene comentarios de un evento específico
- **Filtros**: Solo comentarios con `estado: true` y `aprobacion: [0, 2]`
- **Respuesta**: Lista de comentarios con estado y fecha

```json
{
  "mensaje": "Comentarios obtenidos exitosamente",
  "comentarios": [
    {
      "id": 1,
      "contenido": "Comentario de ejemplo",
      "estado": true,
      "aprobacion": 0,
      "fecha_hora": "2025-06-15T12:00:00.000Z"
    }
  ]
}
```

### `POST /api/comentario`
**Crear Comentario**

- **Rol**: 4 (Aplicación Móvil)
- **Descripción**: Permite crear nuevos comentarios
- **Requerido**: Token de autenticación
- **Cuerpo**: `contenido`, `eventoid`
- **Respuesta**: Comentario creado con ID y estado

```json
{
  "mensaje": "Comentario creado exitosamente",
  "comentario": {
    "id": 1,
    "usuarioid": 1,
    "eventoid": 1,
    "contenido": "Nuevo comentario",
    "fecha_hora": "2025-06-15T12:00:00.000Z",
    "estado": true,
    "aprobacion": 1
  }
}
```

### `PATCH /api/comentario/:id`
**Actualizar Comentario**

- **Rol**: 4 (Aplicación Móvil)
- **Descripción**: Actualiza el contenido de un comentario propio
- **Requerido**: Token de autenticación
- **Cuerpo**: `contenido`
- **Respuesta**: Comentario actualizado

```json
{
  "mensaje": "Comentario actualizado exitosamente",
  "comentario": {
    "id": 1,
    "contenido": "Nuevo contenido actualizado",
    "fechaActualizacion": "2025-06-15T12:00:00.000Z",
    "eventoid": 1
  }
}
```

### `DELETE /api/comentario/:id`
**Eliminar Comentario**

- **Rol**: 4 (Aplicación Móvil)
- **Descripción**: Elimina un comentario propio
- **Requerido**: Token de autenticación
- **Respuesta**: Mensaje de confirmación

```json
{
  "mensaje": "Comentario eliminado exitosamente"
}
```

## Endpoints Administrativos

### `GET /api/comentario/reportados`
**Listar Comentarios Reportados**

- **Rol**: 1, 2 (Admin/SuperAdmin)
- **Descripción**: Lista comentarios reportados pendientes de revisión
- **Respuesta**: Lista de comentarios reportados con detalles

```json
{
  "mensaje": "Comentarios reportados obtenidos exitosamente",
  "comentarios": [
    {
      "id": 1,
      "contenido": "Comentario reportado",
      "estado": true,
      "aprobacion": 0,
      "fecha_hora": "2025-06-15T12:00:00.000Z",
      "usuario": {
        "id": 1,
        "nombre": "Usuario Ejemplo",
        "correo": "usuario@ejemplo.com"
      },
      "evento": {
        "id": 1,
        "nombre": "Evento de ejemplo"
      }
    }
  ]
}
```

### `PUT /api/comentario/:id/estado`
**Actualizar Estado de Comentario Reportado**

- **Rol**: 1, 2 (Admin/SuperAdmin)
- **Descripción**: Actualiza el estado de aprobación de un comentario reportado
- **Cuerpo**: `aprobacion` (0: pendiente, 1: aceptado, 2: rechazado)
- **Respuesta**: Comentario actualizado con nuevo estado

```json
{
  "mensaje": "Estado del comentario actualizado exitosamente",
  "detalle": "El comentario ha sido aceptado y desactivado",
  "comentario": {
    "id": 1,
    "estado": false,
    "aprobacion": 1
  }
}
```

---

## Errores Comunes

```json
// Error de autenticación
{
  "mensaje": "No tienes permiso para ver los comentarios",
  "error": "Token inválido o expirado"
}

// Error de validación
{
  "mensaje": "Faltan datos requeridos",
  "detalles": {
    "eventoid": "El ID del evento es requerido",
    "contenido": "El contenido del comentario es requerido"
  }
}

// Error de longitud
{
  "mensaje": "El contenido del comentario excede el límite de caracteres",
  "maximo": 500,
  "actual": 550
}

// Error de permisos
{
  "mensaje": "No tienes permiso para actualizar el estado del comentario",
  "detalle": "Solo administradores pueden actualizar estados de reportes"
}

// Error de recurso no encontrado
{
  "mensaje": "Comentario no encontrado"
}
```

---

## Obtener Comentarios

### `GET /api/comentarios`

Obtiene la lista de comentarios según el rol del usuario.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Todos los roles autenticados

#### Comportamiento por Rol
- **Admin/SuperAdmin (1,2)**: Ve todos los comentarios
- **Propietario (3)**: Ve los comentarios de sus eventos
- **Usuario (4)**: Ve sus propios comentarios

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Lista de comentarios obtenida exitosamente",
  "comentarios": [
    {
      "id": 1,
      "contenido": "Comentario de ejemplo",
      "estado": true,
      "aprobacion": 1,
      "fecha_hora": "2025-06-15T12:00:00.000Z",
      "usuario": {
        "id": 1,
        "nombre": "Usuario Ejemplo",
        "correo": "usuario@ejemplo.com"
      },
      "evento": {
        "id": 1,
        "nombre": "Evento de ejemplo"
      }
    }
  ]
}
```

---

## Obtener Comentarios por Evento

### `GET /api/comentarios/evento/:eventoid`

Obtiene los comentarios de un evento específico con diferentes niveles de acceso según el rol.

#### Autenticación
- Requiere token de autenticación

#### Parámetros de Ruta
- `eventoid` (requerido): ID del evento

#### Comportamiento por Rol
- **Admin/SuperAdmin (1,2)**: Ve todos los comentarios (activos e inactivos)
- **Propietario (3)**: Ve solo comentarios de sus eventos con `estado: true`
- **Usuario (4)**: Ve comentarios con `estado: true` y `aprobacion: [0, 2]` (pendientes o rechazados)

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Comentarios obtenidos exitosamente",
  "comentarios": [
    {
      "id": 1,
      "contenido": "Comentario de ejemplo",
      "estado": true,
      "aprobacion": 1,
      "fecha_hora": "2025-06-15T12:00:00.000Z"
    }
  ]
}
```

---

## Crear Comentario

### `POST /api/comentario`

Crea un nuevo comentario.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Usuario (4)

#### Cuerpo de la Petición
```json
{
  "eventoid": 1,
  "contenido": "Nuevo comentario",
  "calificacion": 5
}
```

#### Respuesta Exitosa (201)
```json
{
  "mensaje": "Comentario creado exitosamente",
  "comentario": {
    "id": 1,
    "contenido": "Nuevo comentario",
    "estado": true,
    "aprobacion": 0,
    "fecha_hora": "2025-06-15T12:00:00.000Z"
  }
}
```

---

## Actualizar Comentario

### `PATCH /api/comentario/:id`

Actualiza un comentario existente.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Usuario (4) - Solo sus propios comentarios

#### Parámetros de Ruta
- `id` (requerido): ID del comentario a actualizar

#### Cuerpo de la Petición
```json
{
  "contenido": "Comentario actualizado",
  "calificacion": 4
}
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Comentario actualizado exitosamente",
  "comentario": {
    "id": 1,
    "contenido": "Comentario actualizado",
    "estado": true,
    "aprobacion": 0,
    "fecha_hora": "2025-06-15T12:00:00.000Z"
  }
}
```

---

## Eliminar Comentario

### `DELETE /api/comentario/:id`

Elimina un comentario (borrado lógico).

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Admin/SuperAdmin (1,2): Cualquier comentario
- Usuario (4): Solo sus propios comentarios

#### Parámetros de Ruta
- `id` (requerido): ID del comentario a eliminar

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Comentario eliminado exitosamente"
}
```

---

## Listar Comentarios Reportados

### `GET /api/comentario/reportados`

Obtiene la lista de comentarios reportados.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Admin/SuperAdmin (1,2)

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Comentarios reportados obtenidos exitosamente",
  "comentarios": [
    {
      "id": 1,
      "contenido": "Comentario reportado",
      "estado": true,
      "aprobacion": 0,
      "reportes": 3,
      "fecha_hora": "2025-06-15T12:00:00.000Z"
    }
  ]
}
```

---

## Actualizar Estado de Comentario Reportado

### `PUT /api/comentario/:id/estado`

Actualiza el estado de un comentario reportado.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Admin/SuperAdmin (1,2)

#### Cuerpo de la Petición
```json
{
  "aprobacion": 1,  // 0: pendiente, 1: aprobado, 2: rechazado
  "estado": true    // true: activo, false: inactivo
}
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Estado del comentario actualizado exitosamente",
  "comentario": {
    "id": 1,
    "estado": true,
    "aprobacion": 1
  }
}
```

---

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Creado - Recurso creado exitosamente |
| 400 | Solicitud incorrecta - Datos inválidos |
| 401 | No autorizado - Token inválido o faltante |
| 403 | Prohibido - Sin permisos suficientes |
| 404 | No encontrado - Recurso no existe |
| 500 | Error interno del servidor |
