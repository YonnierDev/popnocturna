# Documentación de Endpoints - Eventos

## Tabla de Contenidos
- [Eventos Públicos](#eventos-publicos)
- [Eventos Privados](#eventos-privados)
- [Crear Evento](#crear-evento)
- [Actualizar Evento](#actualizar-evento)
- [Listar Reservas](#listar-reservas)

## Eventos Públicos

### `GET /api/public/eventos`
**Obtener lista de eventos públicos**

- **Autenticación**: No requerida
- **Respuesta**: Lista de eventos públicos con información básica

```json
{
  "mensaje": "Lista de eventos públicos obtenida exitosamente",
  "eventos": [
    {
      "id": 1,
      "nombre": "Evento de ejemplo",
      "descripcion": "Descripción del evento",
      "fecha_hora": "2025-06-15T12:00:00.000Z",
      "portada": [
        "https://res.cloudinary.com/.../evento-1.jpg",
        "https://res.cloudinary.com/.../evento-2.jpg"
      ],
      "lugar": {
        "id": 1,
        "nombre": "Nombre del lugar"
      }
    }
  ]
}
```

### `GET /api/public/evento/:id`
**Ver detalles de un evento público específico**

- **Autenticación**: No requerida
- **Parámetros de ruta**: `id` (ID del evento)
- **Respuesta**: Detalles completos del evento

```json
{
  "mensaje": "Evento obtenido exitosamente",
  "evento": {
    "id": 1,
    "nombre": "Evento de ejemplo",
    "descripcion": "Descripción detallada",
    "fecha_hora": "2025-06-15T12:00:00.000Z",
    "portada": [
      "https://res.cloudinary.com/.../evento-1.jpg",
      "https://res.cloudinary.com/.../evento-2.jpg"
    ],
    "lugar": {
      "id": 1,
      "nombre": "Nombre del lugar",
      "direccion": "Dirección del lugar"
    }
  }
}
```

## Eventos Privados

### `GET /api/eventos`
**Obtener lista de eventos según el rol del usuario**

- **Autenticación**: Requiere token
- **Roles permitidos**: 1, 2, 3, 4
- **Respuesta**: Lista de eventos según el rol

```json
// Para Admin/SuperAdmin (rol 1,2)
{
  "mensaje": "Lista de eventos obtenida exitosamente",
  "eventos": [
    {
      "id": 1,
      "nombre": "Evento de ejemplo",
      "estado": true,
      "aprobacion": 1
    }
  ]
}

// Para Propietario (rol 3)
{
  "mensaje": "Eventos de tus lugares obtenidos exitosamente",
  "eventos": [
    {
      "id": 1,
      "nombre": "Evento de ejemplo",
      "lugar": {
        "id": 1,
        "nombre": "Mi lugar"
      }
    }
  ]
}
```

## Crear Evento

### `POST /api/evento`
**Crear un nuevo evento con imágenes de portada**

- **Autenticación**: Requiere token
- **Roles permitidos**: 1, 2, 3
- **Método**: POST
- **Contenido**: multipart/form-data
- **Parámetros del cuerpo**:
  - `portada`: Archivo(s) de imagen (máximo 3)
  - `nombre`: string (requerido)
  - `descripcion`: string (requerido)
  - `fecha_hora`: string (formato ISO)
  - `lugarid`: number (requerido para rol 3)

```json
// Ejemplo de petición
{
  "nombre": "Mi Evento",
  "descripcion": "Descripción del evento",
  "fecha_hora": "2025-06-15T12:00:00.000Z",
  "lugarid": 1
}

// Ejemplo de respuesta exitosa
{
  "mensaje": "Evento creado correctamente",
  "datos": {
    "id": 1,
    "nombre": "Mi Evento",
    "descripcion": "Descripción del evento",
    "fecha_hora": "2025-06-15T12:00:00.000Z",
    "portada": [
      "https://res.cloudinary.com/.../evento-1.jpg"
    ],
    "estado": true,
    "aprobacion": 1,
    "lugar": {
      "id": 1,
      "nombre": "Mi lugar"
    }
  }
}
```

## Actualizar Evento

### `PUT /api/evento/:id`
**Actualizar un evento existente**

- **Autenticación**: Requiere token
- **Roles permitidos**: 1, 2, 3
- **Parámetros de ruta**: `id` (ID del evento)
- **Cuerpo**: Campos a actualizar

```json
// Ejemplo de petición
{
  "nombre": "Nuevo nombre del evento",
  "descripcion": "Nueva descripción"
}

// Ejemplo de respuesta exitosa
{
  "mensaje": "Evento actualizado exitosamente",
  "evento": {
    "id": 1,
    "nombre": "Nuevo nombre del evento",
    "descripcion": "Nueva descripción",
    "fechaActualizacion": "2025-06-15T12:00:00.000Z"
  }
}
```

## Listar Reservas

### `GET /api/evento/:eventoId/reservas`
**Listar reservas de un evento específico**

- **Autenticación**: Requiere token
- **Roles permitidos**: 1, 2, 3
- **Parámetros de ruta**: `eventoId` (ID del evento)
- **Respuesta**: Lista de reservas del evento

```json
{
  "mensaje": "Reservas del evento obtenidas exitosamente",
  "reservas": [
    {
      "id": 1,
      "fecha_hora": "2025-06-15T12:00:00.000Z",
      "usuario": {
        "id": 1,
        "nombre": "Usuario Ejemplo"
      }
    }
  ]
}
```

## Errores Comunes

```json
// Error de autenticación
{
  "mensaje": "No tienes permiso para acceder a este recurso",
  "error": "Token inválido o expirado"
}

// Error de permisos
{
  "mensaje": "No tienes permiso para crear eventos",
  "error": "Este rol no tiene permiso para crear eventos"
}

// Error de validación (creación de evento)
{
  "mensaje": "Error de validación",
  "error": "Se requiere al menos una imagen de portada"
}

// Error de validación (número de imágenes)
{
  "mensaje": "Error de validación",
  "error": "Se permiten máximo 3 imágenes de portada"
}

// Error de lugar no encontrado
{
  "mensaje": "Error al crear evento",
  "error": "No tienes permiso para crear eventos en este lugar o el lugar no existe"
}

// Error de recurso no encontrado
{
  "mensaje": "Evento no encontrado",
  "error": "El evento con el ID especificado no existe"
}
```
