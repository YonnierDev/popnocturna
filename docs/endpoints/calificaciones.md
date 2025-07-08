# Endpoints de Calificaciones

## 1. Listar Todas las Calificaciones

### GET `/calificaciones`

**Descripción:** Lista todas las calificaciones del sistema.

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Todos

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "calificaciones": [
        {
            "id": 1,
            "puntuacion": 4,
            "comentario": "Excelente servicio",
            "usuario": {
                "id": 1,
                "nombre": "Juan",
                "apellido": "Perez"
            },
            "lugar": {
                "id": 1,
                "nombre": "MACABI"
            },
            "estado": true,
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

**Errores posibles:**
- 401: Token no válido
- 500: Error interno del servidor

## 2. Listar Calificaciones por Lugar

### GET `/calificaciones/lugar/:lugarid`

**Descripción:** Lista todas las calificaciones para un lugar específico.

**Parámetros de URL:**
- `lugarid` (number): ID del lugar

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Propietario del lugar

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "calificaciones": [
        {
            "id": 1,
            "puntuacion": 4,
            "comentario": "Excelente servicio",
            "usuario": {
                "id": 1,
                "nombre": "Juan",
                "apellido": "Perez"
            },
            "estado": true,
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

**Errores posibles:**
- 401: Token no válido
- 403: No tienes permiso para ver las calificaciones de este lugar
- 404: Lugar no encontrado
- 500: Error interno del servidor

## 3. Ver Calificación por ID

### GET `/calificacion/:id`

**Descripción:** Muestra los detalles de una calificación específica.

**Parámetros de URL:**
- `id` (number): ID de la calificación

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Todos

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "calificacion": {
        "id": 1,
        "puntuacion": 4,
        "comentario": "Excelente servicio",
        "usuario": {
            "id": 1,
            "nombre": "Juan",
            "apellido": "Perez"
        },
        "lugar": {
            "id": 1,
            "nombre": "MACABI"
        },
        "estado": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Errores posibles:**
- 401: Token no válido
- 404: Calificación no encontrada
- 500: Error interno del servidor

## 4. Crear Calificación

### POST `/calificacion`

**Descripción:** Crea una nueva calificación para un lugar.

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Todos excepto propietario

**Body (JSON):**
```json
{
    "lugarid": 1,
    "puntuacion": 4,
    "comentario": "Excelente servicio"
}
```

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "message": "Calificación creada exitosamente",
    "calificacion": {
        "id": 1,
        "lugarid": 1,
        "puntuacion": 4,
        "comentario": "Excelente servicio",
        "usuario": {
            "id": 1,
            "nombre": "Juan",
            "apellido": "Perez"
        },
        "lugar": {
            "id": 1,
            "nombre": "MACABI"
        },
        "estado": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para crear calificaciones
- 404: Lugar no encontrado
- 500: Error interno del servidor

## 5. Actualizar Calificación

### PUT `/calificacion/:id`

**Descripción:** Actualiza una calificación existente.

**Parámetros de URL:**
- `id` (number): ID de la calificación

**Body (JSON):**
```json
{
    "puntuacion": 5,
    "comentario": "Excelente servicio, volveré pronto"
}
```

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Todos excepto propietario

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Calificación actualizada exitosamente",
    "calificacion": {
        "id": 1,
        "lugarid": 1,
        "puntuacion": 5,
        "comentario": "Excelente servicio, volveré pronto",
        "usuario": {
            "id": 1,
            "nombre": "Juan",
            "apellido": "Perez"
        },
        "lugar": {
            "id": 1,
            "nombre": "MACABI"
        },
        "estado": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para actualizar esta calificación
- 404: Calificación no encontrada
- 500: Error interno del servidor

## 6. Eliminar Calificación

### DELETE `/calificacion/:id`

**Descripción:** Elimina una calificación existente.

**Parámetros de URL:**
- `id` (number): ID de la calificación

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Admin, super admin y usuario que creó la calificación

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Calificación eliminada exitosamente"
}
```

**Errores posibles:**
- 401: Token no válido
- 403: No tienes permiso para eliminar esta calificación
- 404: Calificación no encontrada
- 500: Error interno del servidor

## 7. Cambiar Estado de Calificación

### PATCH `/calificacion/estado/:id`

**Descripción:** Cambia el estado de una calificación (activa/inactiva).

**Parámetros de URL:**
- `id` (number): ID de la calificación

**Body (JSON):**
```json
{
    "estado": false
}
```

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Admin y super admin

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Estado de la calificación actualizado exitosamente",
    "calificacion": {
        "id": 1,
        "estado": false
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para cambiar el estado
- 404: Calificación no encontrada
- 500: Error interno del servidor
