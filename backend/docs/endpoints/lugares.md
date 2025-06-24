# Documentación de Endpoints - Lugares

## Tabla de Contenidos
- [Listar Lugares Públicos](#listar-lugares-públicos)
- [Listar Lugares](#listar-lugares)
- [Buscar Lugar por ID](#buscar-lugar-por-id)
- [Crear Lugar](#crear-lugar)
- [Actualizar Lugar](#actualizar-lugar)
- [Eliminar Lugar](#eliminar-lugar)
- [Cambiar Estado de Lugar](#cambiar-estado-de-lugar)

---

## Listar Lugares Públicos

### `GET /api/public/lugares`

Obtiene la lista de lugares aprobados y visibles al público.

#### Autenticación
- No requiere autenticación

#### Parámetros de Consulta
- `categoria`: Filtrar por ID de categoría (opcional)
- `buscar`: Búsqueda por nombre o descripción (opcional)
- `limite`: Número de resultados por página (opcional, por defecto 10)
- `pagina`: Número de página (opcional, por defecto 1)

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Lista de lugares obtenida exitosamente",
  "total": 15,
  "paginaActual": 1,
  "totalPaginas": 2,
  "lugares": [
    {
      "id": 1,
      "nombre": "Nombre del Lugar",
      "descripcion": "Descripción del lugar",
      "ubicacion": "Dirección del lugar",
      "imagen": "https://res.cloudinary.com/.../imagen.jpg",
      "fotos_lugar": [
        "https://res.cloudinary.com/.../foto1.jpg",
        "https://res.cloudinary.com/.../foto2.jpg"
      ],
      "categoria": {
        "id": 1,
        "nombre": "Nombre de la categoría"
      },
      "estado": true,
      "createdAt": "2025-06-22T00:00:00.000Z"
    }
  ]
}
```

---

## Listar Lugares

### `GET /api/lugares`

Obtiene la lista de lugares según el rol del usuario.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- SuperAdmin (1): Ve todos los lugares
- Admin (2): Ve todos los lugares
- Propietario (3): Ve solo sus lugares

#### Parámetros de Consulta
- `estado`: Filtrar por estado (true/false) (opcional)
- `aprobacion`: Filtrar por estado de aprobación (true/false) (opcional)
- `usuario`: Filtrar por ID de usuario (solo SuperAdmin/Admin)
- `categoria`: Filtrar por ID de categoría (opcional)
- `buscar`: Búsqueda por nombre o descripción (opcional)
- `limite`: Número de resultados por página (opcional, por defecto 10)
- `pagina`: Número de página (opcional, por defecto 1)

#### Respuesta Exitosa (200)
Igual que el endpoint público, pero con campos adicionales según el rol.

---

## Buscar Lugar por ID

### `GET /api/lugar/:id`

Obtiene los detalles de un lugar específico por su ID.

#### Autenticación
- Requiere token de autenticación

#### Parámetros de Ruta
- `id`: ID del lugar (requerido)

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Lugar encontrado",
  "lugar": {
    "id": 1,
    "usuarioid": 3,
    "categoriaid": 2,
    "nombre": "Nombre del Lugar",
    "descripcion": "Descripción detallada",
    "ubicacion": "Dirección exacta",
    "imagen": "https://res.cloudinary.com/.../imagen.jpg",
    "fotos_lugar": [
      "https://res.cloudinary.com/.../foto1.jpg",
      "https://res.cloudinary.com/.../foto2.jpg"
    ],
    "carta_pdf": "https://res.cloudinary.com/.../documento.pdf",
    "estado": true,
    "aprobacion": true,
    "categoria": {
      "id": 2,
      "nombre": "Nombre de la categoría"
    },
    "usuario": {
      "id": 3,
      "nombre": "Nombre del Propietario",
      "correo": "propietario@ejemplo.com"
    },
    "createdAt": "2025-06-22T00:00:00.000Z",
    "updatedAt": "2025-06-22T00:00:00.000Z"
## Actualizar Lugar

### `PUT /api/lugar/:id`

Actualiza la información de un lugar existente. Los campos de archivo son opcionales y se pueden actualizar individualmente.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Propietario (solo sus lugares)
- Admin (2)
- SuperAdmin (1)

#### Parámetros de Ruta
- `id`: ID del lugar a actualizar (requerido)

#### Headers
```
Content-Type: multipart/form-data
Authorization: Bearer [token]
```

#### Campos de Form-Data

| Campo | Tipo | Descripción |
|-------|------|-------------|
| nombre | string | Nombre del lugar |
| descripcion | string | Descripción detallada |
| ubicacion | string | Dirección física |
| categoriaid | number | ID de la categoría |
| imagen | file | Imagen principal (máx. 10MB, formato: jpg, png) |
| fotos_lugar | file[] | Hasta 5 fotos adicionales (máx. 10MB cada una, formato: jpg, png) |
| carta_pdf | file | Documento PDF (máx. 10MB) |

#### Ejemplo de Actualización Parcial (form-data)
```
// Solo actualizando la imagen y descripción
nombre: Mi Restaurante Actualizado
descripcion: Nueva descripción del lugar
imagen: [nueva-imagen.jpg]
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Lugar actualizado con éxito",
  "lugar": {
    "id": 41,
    "usuarioid": 3,
    "categoriaid": 4,
    "nombre": "El Cubo",
    "descripcion": "EL deporte es salud",
    "ubicacion": "Cl. 18 Nte. # 12-143, Comuna 1",
    "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750802704/lugares/lugar-1750802705157-principal.jpg",
    "fotos_lugar": [
      "https://res.cloudinary.com/popaimagen/image/upload/v1750737496/lugares/lugar-1750737496934-0.060674211053047156.jpg"
    ],
    "carta_pdf": null,
    "estado": true,
    "aprobacion": true,
    "createdAt": "2025-06-24T03:58:17.000Z",
    "updatedAt": "2025-06-24T22:05:07.000Z",
    "usuario": {
      "id": 3,
      "nombre": "Propietario",
      "correo": "propietario@gmail.com"
    },
    "categoria": {
      "id": 4,
      "tipo": "Canchas sinteticas"
    }
  },
  "detalles": "Los cambios han sido aplicados correctamente"
}

#### Respuesta de Error (404)
```json
{
  "mensaje": "Error",
  "error": "Lugar no encontrado",
  "detalles": "No se encontró el lugar con el ID especificado"
}
```

---

## Eliminar Lugar

### `DELETE /api/lugar/:id`

Elimina un lugar del sistema (borrado lógico).

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Propietario (solo sus lugares)
- Admin (2)
- SuperAdmin (1)

#### Parámetros de Ruta
- `id`: ID del lugar a eliminar (requerido)

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Lugar eliminado con éxito",
  "id": 1
}
```

---

## Cambiar Estado de Lugar

### `PATCH /api/lugar/estado/:id`

Cambia el estado de aprobación de un lugar.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Admin (2)
- SuperAdmin (1)

#### Parámetros de Ruta
- `id`: ID del lugar (requerido)

#### Body (JSON)
```json
{
  "aprobacion": true
}
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Estado del lugar actualizado exitosamente",
  "lugar": {
    "id": 1,
    "nombre": "Nombre del Lugar",
    "aprobacion": true,
    "updatedAt": "2025-06-22T00:00:00.000Z"
  }
}
```

---

## Códigos de Error Comunes

| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No tiene permisos |
| 404 | Not Found | Lugar no encontrado |
| 413 | Payload Too Large | Archivo(s) demasiado grande(s) |
| 415 | Unsupported Media Type | Tipo de archivo no soportado |
| 500 | Internal Server Error | Error en el servidor |
