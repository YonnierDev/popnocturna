# Documentación de Endpoints - Comentarios

## Tabla de Contenidos
- [Obtener Comentarios](#obtener-comentarios)
- [Obtener Comentarios por Evento](#obtener-comentarios-por-evento)
- [Crear Comentario](#crear-comentario)
- [Actualizar Comentario](#actualizar-comentario)
- [Eliminar Comentario](#eliminar-comentario)
- [Listar Comentarios Reportados](#listar-comentarios-reportados)
- [Actualizar Estado de Comentario Reportado](#actualizar-estado-de-comentario-reportado)

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
