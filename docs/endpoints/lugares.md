# Documentación de Endpoints - Lugares

## Crear un Lugar
```http
POST /propietario/lugar
```
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **Body (form-data)**:
  - `categoriaid` (required): ID de la categoría del lugar
  - `nombre` (required): Nombre del lugar
  - `descripcion` (required): Descripción del lugar
  - `ubicacion` (required): Dirección del lugar
  - `imagen` (required): Imagen principal del lugar (archivo)
  - `fotos_lugar` (optional): Fotos adicionales del lugar (múltiples archivos)
  - `carta_pdf` (optional): Carta en formato PDF (archivo)

- **Respuesta Exitosa (201)**:
  ```json
  {
    "mensaje": "Lugar creado con éxito",
    "lugar": {
      "fotos_lugar": [
        "https://res.cloudinary.com/popaimagen/image/upload/v1748815345/lugares/lugar-1748815345923-0.8008296484217092.avif",
        "https://res.cloudinary.com/popaimagen/image/upload/v1748815345/lugares/lugar-1748815345924-0.9844225737616896.jpg"
      ],
      "id": 20,
      "usuarioid": 3,
      "categoriaid": "4",
      "nombre": "pruba 2",
      "descripcion": "notificaciones",
      "ubicacion": "Cl. 18 Nte. # 12-14",
      "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1748815344/lugares/lugar-1748815344374.jpg",
      "carta_pdf": "https://res.cloudinary.com/popaimagen/raw/upload/v1748815346/documentos/carta-1748815346699.pdf",
      "estado": false,
      "aprobacion": false,
      "updatedAt": "2025-06-01T22:02:27.766Z",
      "createdAt": "2025-06-01T22:02:27.766Z"
    }
  }
  ```

- **Códigos de Error**:
  - `400`: Datos de entrada inválidos o faltantes
  - `401`: No autenticado
  - `403`: No tiene permisos para crear lugares
  - `500`: Error al procesar la solicitud

## Obtener Lugar por ID
```http
GET /api/lugar/:id
```
- **Headers**: 
  - `Authorization: Bearer {token}` (opcional para usuarios no autenticados)
- **Parámetros de Ruta**:
  - `id`: ID del lugar a buscar

- **Respuesta Exitosa (200)**:
  ```json
  {
    "id": 1,
    "nombre": "Nombre del Lugar",
    "descripcion": "Descripción detallada del lugar",
    "ubicacion": "Dirección del lugar",
    "imagen": "url_imagen_principal",
    "fotos_lugar": ["url_foto1", "url_foto2"],
    "carta_pdf": "url_documento_pdf",
    "estado": true,
    "aprobacion": true,
    "categoria": {
      "id": 1,
      "tipo": "Nombre de la categoría"
    },
    "eventos": [
      {
        "id": 1,
        "portada": "url_portada_evento",
        "nombre": "Nombre del Evento",
        "fecha_hora": "2025-06-10T20:00:00.000Z",
        "descripcion": "Descripción del evento",
        "precio": 50000,
        "capacidad": 100
      }
    ]
  }
  ```

- **Códigos de Error**:
  - `400`: ID no proporcionado o inválido
  - `401`: No autenticado (solo para lugares no públicos)
  - `403`: No tiene permisos para ver este lugar
  - `404`: Lugar no encontrado
  - `409`: Lugar inactivo o pendiente de aprobación
  - `500`: Error en el servidor

- **Notas**:
  - Los usuarios normales solo pueden ver lugares aprobados y activos
  - Los propietarios solo pueden ver sus propios lugares (a menos que sean administradores)
  - Los eventos devueltos siempre están filtrados por estado activo (estado = true)
  - Se incluye información de la categoría y eventos relacionados

## Listar Lugares
```http
GET /api/lugares
```
- **Headers**: 
  - `Authorization: Bearer {token}` (opcional para usuarios no autenticados)

- **Respuesta Exitosa (200)**:
  ```json
  {
    "mensaje": "Lugares obtenidos exitosamente",
    "lugares": [
      {
        "id": 1,
        "nombre": "Nombre del Lugar",
        "descripcion": "Descripción breve del lugar",
        "ubicacion": "Dirección del lugar",
        "imagen": "url_imagen_principal",
        "estado": true,
        "aprobacion": true,
        "categoria": {
          "id": 1,
          "tipo": "Nombre de la categoría"
        },
        "eventos": [
          {
            "id": 1,
            "portada": "url_portada_evento",
            "nombre": "Nombre del Evento",
            "fecha_hora": "2025-06-10T20:00:00.000Z"
          }
        ]
      }
    ]
  }
  ```

- **Códigos de Error**:
  - `500`: Error en el servidor

## Actualizar Lugar
```http
PUT /api/lugar/:id
```
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Parámetros de Ruta**:
  - `id`: ID del lugar a actualizar
- **Body**:
  ```json
  {
    "categoriaid": 1,
    "nombre": "string",
    "descripcion": "string",
    "ubicacion": "string",
    "estado": true,
    "aprobacion": true
  }
  ```
- **Respuesta Exitosa (200)**:
  ```json
  {
    "mensaje": "Lugar actualizado con éxito",
    "lugar": {
      "id": 1,
      "nombre": "Nombre Actualizado",
      "descripcion": "Descripción actualizada",
      "ubicacion": "Nueva ubicación",
      "imagen": "url_imagen_actualizada",
      "estado": true,
      "aprobacion": true
    }
  }
  ```

- **Códigos de Error**:
  - `400`: Datos de entrada inválidos o faltantes
  - `401`: No autenticado
  - `403`: No tiene permisos para actualizar este lugar
  - `404`: Lugar no encontrado
  - `500`: Error en el servidor

- **Notas**:
  - Solo el propietario del lugar o un administrador pueden actualizarlo
  - Los campos son opcionales, solo se actualizarán los proporcionados
  - Para actualizar imágenes, usar el endpoint específico de carga de archivos

## Eliminar Lugar
```http
DELETE /api/lugar/:id
```
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Parámetros de Ruta**:
  - `id`: ID del lugar a eliminar

- **Respuesta Exitosa (200)**:
  ```json
  {
    "mensaje": "Lugar eliminado correctamente"
  }
  ```

- **Códigos de Error**:
  - `400`: ID no proporcionado
  - `401`: No autenticado
  - `403`: No tiene permisos para eliminar este lugar
  - `404`: Lugar no encontrado
  - `500`: Error en el servidor

- **Notas**:
  - Solo el propietario del lugar o un administrador pueden eliminarlo
  - Esta acción es irreversible
  - Se eliminarán también todos los eventos asociados al lugar
