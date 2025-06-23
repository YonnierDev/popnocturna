# Endpoints de Categorías

## 1. Listar Todas las Categorías

### GET `/categorias`

**Descripción:** Lista todas las categorías disponibles.

**Autenticación:** No requerida

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "categorias": [
        {
            "id": 1,
            "nombre": "Fútbol",
            "descripcion": "Canchas de fútbol",
            "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750647943/categorias/futbol.jpg",
            "estado": true,
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

**Errores posibles:**
- 500: Error interno del servidor

## 2. Buscar Categoría por ID

### GET `/categoria/:id`

**Descripción:** Busca una categoría específica por su ID.

**Parámetros de URL:**
- `id` (number): ID de la categoría

**Autenticación:** No requerida

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "categoria": {
        "id": 1,
        "nombre": "Fútbol",
        "descripcion": "Canchas de fútbol",
        "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750647943/categorias/futbol.jpg",
        "estado": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Errores posibles:**
- 404: Categoría no encontrada
- 500: Error interno del servidor

## 3. Obtener Lugares por Categoría

### GET `/categoria/:id/lugares`

**Descripción:** Lista todos los lugares que pertenecen a una categoría específica.

**Parámetros de URL:**
- `id` (number): ID de la categoría

**Autenticación:** No requerida

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "categoria": {
        "id": 1,
        "nombre": "Fútbol",
        "descripcion": "Canchas de fútbol"
    },
    "lugares": [
        {
            "id": 1,
            "nombre": "MACABI",
            "descripcion": "Canchas sintéticas para partidos nocturnos",
            "ubicacion": "Variante Norte",
            "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750647943/lugares/macabi.jpg",
            "estado": true
        }
    ]
}
```

**Errores posibles:**
- 404: Categoría no encontrada
- 500: Error interno del servidor

## 4. Crear Categoría

### POST `/categoria`

**Descripción:** Crea una nueva categoría.

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 1 (admin)

**Body (multipart/form-data):**
```json
{
    "nombre": "Fútbol",
    "descripcion": "Canchas de fútbol",
    "imagen": "file.jpg" // Archivo opcional
}
```

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "message": "Categoría creada exitosamente",
    "categoria": {
        "id": 1,
        "nombre": "Fútbol",
        "descripcion": "Canchas de fútbol",
        "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750647943/categorias/futbol.jpg",
        "estado": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para crear categorías
- 413: Archivo de imagen demasiado grande
- 500: Error interno del servidor

## 5. Actualizar Categoría

### PUT `/categoria/:id`

**Descripción:** Actualiza una categoría existente.

**Parámetros de URL:**
- `id` (number): ID de la categoría

**Body (multipart/form-data):**
```json
{
    "nombre": "Fútbol",
    "descripcion": "Canchas de fútbol",
    "imagen": "file.jpg" // Archivo opcional
}
```

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 1 (admin)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Categoría actualizada exitosamente",
    "categoria": {
        "id": 1,
        "nombre": "Fútbol",
        "descripcion": "Canchas de fútbol",
        "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750647943/categorias/futbol.jpg",
        "estado": true
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para actualizar esta categoría
- 404: Categoría no encontrada
- 413: Archivo de imagen demasiado grande
- 500: Error interno del servidor

## 6. Eliminar Categoría

### DELETE `/categoria/:id`

**Descripción:** Elimina una categoría existente.

**Parámetros de URL:**
- `id` (number): ID de la categoría

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 1 (admin)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Categoría eliminada exitosamente"
}
```

**Errores posibles:**
- 401: Token no válido
- 403: No tienes permiso para eliminar esta categoría
- 404: Categoría no encontrada
- 500: Error interno del servidor

## 7. Actualizar Estado de Categoría

### PATCH `/categoria/estado/:id`

**Descripción:** Cambia el estado de una categoría (activa/inactiva).

**Parámetros de URL:**
- `id` (number): ID de la categoría

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
    "message": "Estado de la categoría actualizado exitosamente",
    "categoria": {
        "id": 1,
        "estado": false
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para cambiar el estado
- 404: Categoría no encontrada
- 500: Error interno del servidor
