# Documentación de la API PopNocturna

## Autenticación

Todas las rutas (excepto las marcadas como públicas) requieren autenticación mediante JWT en el header:
```
Authorization: Bearer <token>
```

## Endpoints de Eventos

### Listar eventos públicos
```
GET /api/public/eventos
```
**Descripción:** Obtiene la lista de eventos públicos.
**Roles permitidos:** Público (sin autenticación)

### Ver detalle de evento público
```
GET /api/public/evento/:id
```
**Descripción:** Obtiene los detalles de un evento específico.
**Roles permitidos:** Público (sin autenticación)

### Listar eventos (protegido)
```
GET /api/eventos
```
**Descripción:** Lista todos los eventos (requiere autenticación).
**Roles permitidos:** Todos los roles autenticados
**Parámetros opcionales:**
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `estado`: Filtrar por estado

### Crear evento
```
POST /api/evento
Content-Type: multipart/form-data
```
**Descripción:** Crea un nuevo evento con imágenes.
**Roles permitidos:** Admin (1), Propietario (3)
**Parámetros requeridos:**
- `nombre`: String
- `descripcion`: String
- `fecha_hora`: DateTime
- `precio`: Decimal
- `capacidad`: Integer
- `lugarid`: Integer
- `portada`: Imágenes (máx. 3)

### Listar reservas de un evento
```
GET /api/evento/:eventoId/reservas
```
**Descripción:** Obtiene las reservas de un evento específico.
**Roles permitidos:** Admin (1, 2), Propietario del evento (3)
**Parámetros opcionales:**
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `estado`: Filtrar por estado de reserva

## Endpoints de Reservas

### Listar reservas del usuario
```
GET /api/reservas
```
**Descripción:** Lista las reservas del usuario autenticado.
**Roles permitidos:** Usuario (4)
**Parámetros opcionales:**
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `estado`: Filtrar por estado
- `fechaDesde`: Filtrar desde fecha
- `fechaHasta`: Filtrar hasta fecha

### Buscar reserva por número
```
GET /api/reserva/numero/:numero
```
**Descripción:** Busca una reserva por su número.
**Roles permitidos:** Usuario (4)

### Crear reserva
```
POST /api/reserva
Content-Type: application/json
```
**Descripción:** Crea una nueva reserva.
**Roles permitidos:** Usuario (4)
**Cuerpo de la petición:**
```json
{
  "eventoid": 1,
  "cantidad_entradas": 2,
  "metodo_pago": "tarjeta"
}
```

## Estructura de Respuestas

### Respuesta exitosa (ejemplo)
```json
{
  "mensaje": "Operación exitosa",
  "datos": [
    {
      "id": 1,
      "numero_reserva": "RES123456",
      "fecha_hora": "2025-06-11T15:30:00.000Z",
      "estado": true,
      "evento": {
        "id": 1,
        "nombre": "Fiesta de Año Nuevo",
        "fecha_hora": "2025-12-31T23:00:00.000Z",
        "portada": [
          "https://res.cloudinary.com/popaimagen/image/upload/v1749275670/eventos/evento-1749275671339-51.jpg"
        ],
        "lugar": {
          "id": 1,
          "nombre": "Sala de Eventos Principal"
        }
      }
    }
  ],
  "metadata": {
    "total": 1,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 1
  }
}
```

### Respuesta de error (ejemplo)
```json
{
  "mensaje": "Error en la operación",
  "error": "Mensaje detallado del error"
}
```

## Códigos de Estado HTTP

- `200 OK`: Petición exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en los datos de entrada
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No tiene permisos para acceder al recurso
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Notas Adicionales

- Las fechas deben estar en formato ISO 8601 (ej: "2025-12-31T23:00:00.000Z")
- Las imágenes se manejan a través de Cloudinary
- Los roles disponibles son:
  - 1: Super Administrador
  - 2: Administrador
  - 3: Propietario
  - 4: Usuario
