# Endpoints de Reservas

## 1. Crear Reserva

### POST `/reserva`

**Descripción:** Crea una nueva reserva en el sistema. La fecha y hora de la reserva se establecerán automáticamente con la fecha y hora actual del servidor.

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Usuario (rol 4)

**Cuerpo de la petición (JSON):**
```json
{
    "eventoid": 1,
    "cantidad_entradas": 1
}
```

**Campos requeridos:**
- `eventoid` (number): ID del evento para el cual se desea hacer la reserva

**Campos opcionales:**
- `cantidad_entradas` (number, default: 1): Número de entradas a reservar (mínimo 1)

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "mensaje": "Reserva creada exitosamente",
    "data": {
        "id": 21,
        "numero_reserva": "RES-021",
        "aprobacion": "Pendiente",
        "estado": true,
        "cantidad_entradas": 1,
        "evento": {
            "nombre": "Torneo Relámpago",
            "lugar": {
                "nombre": "MACABI"
            }
        }
    },
    "capacidadActual": 14,
    "capacidadTotal": 16
}
```

**Campos de respuesta:**
- `data`: Contiene los detalles de la reserva creada
  - `id`: ID de la reserva
  - `numero_reserva`: Número único de la reserva (formato: RES-XXX)
  - `aprobacion`: Estado de aprobación de la reserva (Pendiente/Aprobado/Rechazado)
  - `estado`: Estado activo/inactivo de la reserva
  - `cantidad_entradas`: Número de entradas reservadas
  - `evento`: Información básica del evento
    - `nombre`: Nombre del evento
    - `lugar`: Información del lugar donde se realizará el evento
      - `nombre`: Nombre del lugar
- `capacidadActual`: Capacidad disponible actual del evento después de la reserva
- `capacidadTotal`: Capacidad total del evento

**Errores posibles:**
- 400: Datos inválidos o faltantes
- 401: Token no válido
- 403: No tienes permiso para crear reservas
- 404: Evento no encontrado

## 2. Listar Todas las Reservas

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

## 3. Buscar Reserva por Número

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

## 4. Actualizar Reserva

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

## 5. Eliminar Reserva

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

## 6. Actualizar Estado de Reserva

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

## 7. Aprobar/Rechazar Reserva

### PATCH `/reserva/aprobar/:numero_reserva`

**Descripción:** Aprobar o rechazar una reserva. Solo los propietarios (rol 3) pueden aprobar o rechazar reservas de sus propios eventos.

**Parámetros de URL:**
- `numero_reserva` (string): Número de la reserva (puede incluir o no el prefijo 'RES-')

**Body (JSON):**
```json
{
    "aprobacion": "aceptado" // Valores posibles: "aceptado", "rechazado" o "pendiente"
}
```

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 3 (propietario)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "mensaje": "Reserva aprobada correctamente",
    "data": {
        "id": 18,
        "numero_reserva": "RES-001",
        "aprobacion": "aceptado",
        "estado": true,
        "fecha_actualizacion": "2025-06-24T07:40:16.714Z"
    }
}
```

**Campos de respuesta exitosa:**
- `success`: Indica si la operación fue exitosa
- `mensaje`: Mensaje descriptivo del resultado
- `data`: Contiene los detalles actualizados de la reserva
  - `id`: ID de la reserva
  - `numero_reserva`: Número de la reserva
  - `aprobacion`: Nuevo estado de aprobación (aceptado/rechazado/pendiente)
  - `estado`: Estado actual de la reserva
  - `fecha_actualizacion`: Fecha y hora de la última actualización

**Errores posibles:**
- 400: 
  - Número de reserva no proporcionado
  - Estado de aprobación no válido
  - La reserva ya se encuentra en el estado solicitado
- 401: Token no válido o no proporcionado
- 403: No tienes permiso para aprobar/rechazar esta reserva
- 404: Reserva no encontrada
- 500: Error interno del servidor

**Notas:**
- Solo el propietario del lugar donde se realiza el evento puede aprobar o rechazar reservas
- Los valores de aprobación son insensibles a mayúsculas/minúsculas
- La respuesta incluye la fecha y hora de la última actualización de la reserva
