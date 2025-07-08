# Endpoints de Perfil

## 1. Obtener Perfil

### GET `/perfil`

**Descripción:** Obtiene los datos del perfil del usuario autenticado.

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Role 1 (admin), Role 2 (super admin), Role 3 (propietario)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "perfil": {
        "id": 1,
        "nombre": "Juan",
        "apellido": "Perez",
        "correo": "juan@example.com",
        "telefono": "1234567890",
        "rol": 1,
        "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750647943/perfiles/perfil-1750647943206.jpg",
        "estado": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Errores posibles:**
- 401: Token no válido
- 403: No tienes permiso para ver este perfil
- 500: Error interno del servidor

## 2. Actualizar Perfil

### PUT `/perfil`

**Descripción:** Actualiza los datos del perfil del usuario autenticado. Permite subir una nueva imagen de perfil.

**Autenticación:** Requerida (JWT)

**Roles permitidos:** Todos los roles autenticados

**Body (multipart/form-data):**
```json
{
    "nombre": "Juan",
    "apellido": "Perez",
    "telefono": "1234567890",
    "imagen": "file.jpg" // Archivo opcional
}
```

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Perfil actualizado exitosamente",
    "perfil": {
        "id": 1,
        "nombre": "Juan",
        "apellido": "Perez",
        "correo": "juan@example.com",
        "telefono": "1234567890",
        "rol": 1,
        "imagen": "https://res.cloudinary.com/popaimagen/image/upload/v1750647943/perfiles/perfil-1750647943206.jpg",
        "estado": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: Token no válido
- 403: No tienes permiso para actualizar este perfil
- 413: Archivo de imagen demasiado grande
- 500: Error interno del servidor
