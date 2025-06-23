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
  }
}
```

---

## Crear Lugar

### `POST /api/lugar`

Crea un nuevo lugar en el sistema.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Propietario (3)
- Admin (2)
- SuperAdmin (1)

#### FormData
- `nombre`: (string, requerido) Nombre del lugar
- `descripcion`: (string, requerido) Descripción detallada
- `ubicacion`: (string, requerido) Dirección física
- `categoriaid`: (number, requerido) ID de la categoría
- `imagen`: (file, opcional) Imagen principal (máx. 10MB)
- `fotos_lugar`: (file[], opcional) Hasta 5 fotos adicionales
- `carta_pdf`: (file, opcional) Documento PDF (máx. 10MB)

#### Ejemplo de Body (form-data)
```
nombre: Mi Restaurante
descripcion: Un lugar acogedor para comer
ubicacion: Calle Principal #123
categoriaid: 2
imagen: [archivo.jpg]
fotos_lugar: [foto1.jpg, foto2.jpg]
carta_pdf: [documento.pdf]
```

#### Respuesta Exitosa (201)
```json
{
  "mensaje": "Lugar creado exitosamente",
  "lugar": {
    "id": 1,
    "nombre": "Mi Restaurante",
    "estado": true,
    "aprobacion": false,
    "createdAt": "2025-06-22T00:00:00.000Z"
  }
}
```

---

## Actualizar Lugar

### `PUT /api/lugar/:id`

Actualiza la información de un lugar existente.

#### Autenticación
- Requiere token de autenticación

#### Roles permitidos
- Propietario (solo sus lugares)
- Admin (2)
- SuperAdmin (1)

#### Parámetros de Ruta
- `id`: ID del lugar a actualizar (requerido)

#### FormData
Mismos campos que en la creación, todos opcionales.

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Lugar actualizado con éxito",
  "lugar": {
    "id": 1,
    "nombre": "Nombre Actualizado",
    "estado": true,
    "aprobacion": true,
    "updatedAt": "2025-06-22T00:00:00.000Z"
  }
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
