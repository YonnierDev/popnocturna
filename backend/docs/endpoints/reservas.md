# Endpoints de Reservas

## 1. Listar Todas las Reservas

### GET `/reservas`

**Descripción:** Lista todas las reservas del sistema.

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Todos

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "reservas": [
        {
            "id": 1,
            "numero_reserva": "res-0001",
            "fecha_hora": "2024-01-01T00:00:00.000Z",
            "aprobacion": true,
            "estado": true,
            "evento": {
                "id": 1,
                "nombre": "Torneo Relámpago",
                "fecha_hora": "2024-01-01T00:00:00.000Z"
            },
            "usuario": {
                "id": 1,
                "nombre": "Juan",
                "apellido": "Perez"
            }
        }
    ]
}
```

**Errores posibles:**
- 401: Token no válido
- 500: Error interno del servidor

## 2. Buscar Reserva por Número

### GET `/reserva/:numero_reserva`

**Descripción:** Busca una reserva específica por su número (puede tener o no el prefijo 'res-').

**Parámetros de URL:**
- `numero_reserva` (string): Número de la reserva (ejemplo: "res-0001" o "0001")

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Todos

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "reserva": {
        "id": 1,
        "numero_reserva": "res-0001",
        "fecha_hora": "2024-01-01T00:00:00.000Z",
        "aprobacion": true,
        "estado": true,
        "evento": {
            "id": 1,
            "nombre": "Torneo Relámpago",
            "fecha_hora": "2024-01-01T00:00:00.000Z"
        },
        "usuario": {
            "id": 1,
            "nombre": "Juan",
            "apellido": "Perez"
        }
    }
}
```

**Errores posibles:**
- 401: Token no válido
- 404: Reserva no encontrada
- 500: Error interno del servidor

## 3. Actualizar Reserva

### PUT `/reserva/:id`

**Descripción:** Actualiza una reserva existente.

**Parámetros de URL:**
- `id` (number): ID de la reserva

**Body (JSON):**
```json
{
    "fecha_hora": "2024-01-02T00:00:00.000Z",
    "eventoId": 2
}
```

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 4 (usuario)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Reserva actualizada exitosamente",
    "reserva": {
        "id": 1,
        "numero_reserva": "res-0001",
        "fecha_hora": "2024-01-02T00:00:00.000Z",
        "eventoId": 2,
        "aprobacion": true,
        "estado": true
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para actualizar esta reserva
- 404: Reserva no encontrada
- 500: Error interno del servidor

## 4. Eliminar Reserva

### DELETE `/reserva/:id`

**Descripción:** Elimina una reserva existente.

**Parámetros de URL:**
- `id` (number): ID de la reserva

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 1 (admin)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Reserva eliminada exitosamente"
}
```

**Errores posibles:**
- 401: Token no válido
- 403: No tienes permiso para eliminar esta reserva
- 404: Reserva no encontrada
- 500: Error interno del servidor

## 5. Actualizar Estado de Reserva

### PATCH `/reserva/estado/:id`

**Descripción:** Cambia el estado de una reserva (activa/inactiva).

**Parámetros de URL:**
- `id` (number): ID de la reserva

**Body (JSON):**
```json
{
    "estado": false
}
```

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 1 (admin) y Role 2 (super admin)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Estado de la reserva actualizado exitosamente",
    "reserva": {
        "id": 1,
        "estado": false
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para cambiar el estado
- 404: Reserva no encontrada
- 500: Error interno del servidor

## 6. Aprobar/Rechazar Reserva

### PATCH `/reserva/aprobar/:numero_reserva`

**Descripción:** Aprobar o rechazar una reserva.

**Parámetros de URL:**
- `numero_reserva` (string): Número de la reserva

**Body (JSON):**
```json
{
    "aprobacion": true // o false para rechazar
}
```

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 1 (admin), Role 2 (super admin) y Role 3 (propietario)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Reserva aprobada/rechazada exitosamente",
    "reserva": {
        "id": 1,
        "numero_reserva": "res-0001",
        "aprobacion": true
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para aprobar/rechazar
- 404: Reserva no encontrada
- 500: Error interno del servidor
