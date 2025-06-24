# API de Gestión de Reportes y Moderación

Este documento describe los endpoints disponibles para gestionar reportes, lugares pendientes y notificaciones del sistema. 

## Base URL

Todas las rutas están prefijadas con `/api/reportes`.

## Autenticación

- Todas las rutas requieren autenticación mediante JWT
- Los roles válidos son:
  - `1`: Administrador
  - `2`: Moderador
  - `3`: Propietario
  - `4`: Usuario

## Endpoints

### 1. Actualizar Estado de Reporte de Comentario

Actualiza el estado de un reporte de comentario (aprobado/rechazado).

- **URL**: `/reporte/comentario/:id/estado`
- **Método**: `PUT`
- **Autenticación requerida**: Sí (JWT)
- **Roles permitidos**: `1` (Admin), `2` (Moderador)

**Parámetros de URL**:
- `id` (requerido): ID del reporte de comentario

**Body (JSON)**:
```json
{
  "aprobacion": true,  // o false para rechazar
  "motivo": "Motivo de la decisión"  // Opcional
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "mensaje": "Estado del reporte actualizado correctamente",
  "reporte": {
    "id": 1,
    "estado": "aprobado"
  }
}
```

**Errores posibles:**
- 400: Datos inválidos o faltantes
- 401: No autenticado
- 403: No autorizado
- 404: Comentario no encontrado
- 500: Error del servidor

### 2. Listar Lugares Pendientes

Obtiene la lista de lugares pendientes de aprobación.

- **URL**: `/lugares/pendientes`
- **Método**: `GET`
- **Autenticación requerida**: Sí (JWT)
- **Roles permitidos**: `1` (Admin), `2` (Moderador)

**Respuesta exitosa (200 OK):**
```json
{
  "mensaje": "Lugares pendientes obtenidos exitosamente",
  "lugares": [
    {
      "id": 1,
      "nombre": "Nombre del lugar",
      "descripcion": "Descripción...",
      "estado": "pendiente",
      "usuarioId": 3
    }
  ]
}
```

**Errores posibles:**
- 401: No autenticado
- 403: No autorizado
- 500: Error del servidor
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

Aprueba o rechaza un lugar pendiente.

- **URL**: `/lugar/:id/estado`
- **Método**: `PUT`
- **Autenticación requerida**: Sí (JWT)
- **Roles permitidos**: `1` (Admin), `2` (Moderador)

**Parámetros de URL**:
- `id` (requerido): ID del lugar

**Body (JSON)**:
```json
{
  "aprobacion": true,  // o false para rechazar
  "estado": true       // alternativa a aprobacion
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "mensaje": "aprobado",
  "lugar": {
    "id": 1,
    "nombre": "Nombre del lugar",
    "aprobacion": true,
    "usuarioId": 3
  },
  "notificaciones": {
    "propietario": "Notificación enviada al propietario",
    "usuarios": "Notificación enviada a todos los usuarios"
  }
}
```

**Errores posibles:**
- 400: El lugar ya está en el estado solicitado
- 401: No autenticado
- 403: No autorizado
- 404: Lugar no encontrado
- 500: Error del servidor

**Notas:**
- Emite notificaciones en tiempo real mediante Socket.IO
- Si se aprueba, notifica a todos los usuarios
- Si se rechaza, solo notifica al propietario

### 4. Obtener Notificaciones de Reportes

Obtiene el contador de reportes pendientes.

- **URL**: `/comentario/reportes/notificaciones`
- **Método**: `GET`
- **Autenticación requerida**: Sí (JWT)
- **Roles permitidos**: `1` (Admin), `2` (Moderador)

**Respuesta exitosa (200 OK):**
```json
{
  "reportesPendientes": 5,
  "tieneNotificaciones": true
}
```

**Errores posibles:**
- 401: No autenticado
- 403: No autorizado
- 500: Error del servidor

### 5. Obtener Notificaciones de Lugares

Obtiene el contador de lugares pendientes.

- **URL**: `/lugares/creacion/notificaciones`
- **Método**: `GET`
- **Autenticación requerida**: Sí (JWT)
- **Roles permitidos**: `1` (Admin), `2` (Moderador)

**Respuesta exitosa (200 OK):**
```json
{
  "lugaresPendientes": 3,
  "tieneNotificaciones": true
}
```

**Errores posibles:**
- 401: No autenticado
- 403: No autorizado
- 500: Error del servidor

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
