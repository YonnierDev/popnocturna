# Documentación de Endpoints - API PopNocturna

## Autenticación

### Login
```http
POST /api/auth/login
```
- **Body**:
  ```json
  {
    "correo": "usuario@ejemplo.com",
    "contrasena": "contraseña123"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Nombre Usuario",
      "correo": "usuario@ejemplo.com",
      "rol": 8
    }
  }
  ```

### Recuperar Contraseña
```http
POST /api/auth/recuperar-contrasena
```
- **Body**:
  ```json
  {
    "correo": "usuario@ejemplo.com"
  }
  ```

## Usuarios

### Listar Usuarios
```http
GET /api/usuarios
```
- **Headers**: `Authorization: Bearer {token}`
- **Respuesta Exitosa**:
  ```json
  {
    "usuarios": [
      {
        "id": 1,
        "nombre": "Usuario 1",
        "correo": "usuario1@ejemplo.com",
        "rol": 8
      }
    ]
  }
  ```

## Roles

### Listar Roles
```http
GET /api/roles
```
- **Respuesta Exitosa**:
  ```json
  {
    "roles": [
      {
        "id": 1,
        "nombre": "SuperAdmin"
      }
    ]
  }
  ```

### Crear Rol
```http
POST /api/rol
```
- **Body**:
  ```json
  {
    "nombre": "Nuevo Rol"
  }
  ```

### Actualizar Rol
```http
PUT /api/rol/:id
```
- **Body**:
  ```json
  {
    "nombre": "Rol Actualizado"
  }
  ```

### Eliminar Rol
```http
DELETE /api/rol/:id
```

## Categorías

### Listar Categorías
```http
GET /api/categorias
```
- **Respuesta Exitosa**:
  ```json
  {
    "categorias": [
      {
        "id": 1,
        "nombre": "Categoría 1",
        "imagen": "url_imagen"
      }
    ]
  }
  ```

### Eliminar Categoría (Roles 1,2)
```http
DELETE /api/categoria/:id
```
- **Headers**: `Authorization: Bearer {token}`

## Lugares

### Listar Lugares
```http
GET /api/lugares
```
- **Respuesta Exitosa**:
  ```json
  {
    "lugares": [
      {
        "id": 1,
        "nombre": "Lugar 1",
        "direccion": "Dirección 1",
        "categoria": "Categoría 1"
      }
    ]
  }
  ```

### Eliminar Lugar
```http
DELETE /api/lugar/:id
```

## Comentarios

### Crear Comentario (Rol 8)
```http
POST /api/comentario
```
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "eventoid": 1,
    "contenido": "Este es un comentario de ejemplo"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Comentario creado exitosamente",
    "comentario": {
      "id": 1,
      "contenido": "Este es un comentario de ejemplo",
      "fecha_hora": "2024-02-20T15:30:00.000Z",
      "estado": true
    }
  }
  ```

### Actualizar Comentario (Rol 8, solo propietario)
```http
PUT /api/comentario/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "contenido": "Comentario actualizado"
  }
  ```

### Eliminar Comentario (Roles 1,2,8)
```http
DELETE /api/comentario/:id
```
- **Headers**: `Authorization: Bearer {token}`

### Reportar Comentario (Rol 3)
```http
POST /api/comentario/:id/reportar
```
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "motivo": "Contenido inapropiado"
  }
  ```

### Obtener Comentarios por Evento
```http
GET /api/comentarios/evento/:eventoid
```
- **Headers**: `Authorization: Bearer {token}`

### Obtener Comentarios Reportados (Roles 1,2)
```http
GET /api/comentario/reportados
```
- **Headers**: `Authorization: Bearer {token}`

## Calificaciones

### Listar Calificaciones
```http
GET /api/calificaciones
```
- **Headers**: `Authorization: Bearer {token}`
- **Respuesta Exitosa**:
  ```json
  {
    "calificaciones": [
      {
        "id": 1,
        "puntuacion": 5,
        "comentario": "Excelente lugar",
        "usuario": {
          "id": 1,
          "nombre": "Usuario 1"
        }
      }
    ]
  }
  ```

### Eliminar Calificación (Roles 1,2,8)
```http
DELETE /api/calificacion/:id
```
- **Headers**: `Authorization: Bearer {token}`

## Reservas

### Listar Reservas (Roles 1,2,3,8)
```http
GET /api/reservas
```
- **Headers**: `Authorization: Bearer {token}`

### Buscar Reserva por Número (Roles 1,2,3)
```http
GET /api/reserva/:numero_reserva
```
- **Headers**: `Authorization: Bearer {token}`

### Eliminar Reserva (Roles 1,2)
```http
DELETE /api/reserva/:id
```
- **Headers**: `Authorization: Bearer {token}`

## Códigos de Estado

- `200`: OK - La solicitud se completó exitosamente
- `201`: Created - Recurso creado exitosamente
- `400`: Bad Request - La solicitud es inválida
- `401`: Unauthorized - No se proporcionó token o es inválido
- `403`: Forbidden - No tiene permisos para realizar la acción
- `404`: Not Found - El recurso no existe
- `500`: Internal Server Error - Error del servidor

## Notas Importantes

1. Todos los endpoints requieren autenticación mediante token JWT (excepto los marcados)
2. Los roles se manejan de la siguiente manera:
   - 1: SuperAdmin
   - 2: Admin
   - 3: Propietario
   - 8: Usuario normal
3. Los estados de aprobación pueden ser:
   - `pendiente`: En espera de revisión
   - `aceptado`: Reporte aprobado
   - `rechazado`: Reporte rechazado
4. Los comentarios tienen un límite de 500 caracteres 