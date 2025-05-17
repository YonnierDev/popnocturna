# Documentación de Endpoints - API PopNocturna

## Autenticación

### Registro de Usuario
```http
POST /api/registrar
```
- **Body**:
  ```json
  {
    "nombre": "string",
    "apellido": "string",
    "correo": "string",
    "contrasena": "string",
    "fecha_nacimiento": "YYYY-MM-DD",
    "genero": "Masculino | Femenino | Otro"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Registro iniciado. Por favor, verifica tu correo electrónico.",
    "correo": "usuario@ejemplo.com"
  }
  ```
- **Notas**:
  - El código de verificación expira en 5 minutos
  - No se puede registrar el mismo correo mientras hay un código activo
  - Se debe validar el correo antes de poder iniciar sesión
  - Si se intenta registrar un correo ya validado, se recibirá un error
  - Los datos se guardan temporalmente hasta la validación

### Reenvío de Código de Verificación
```http
POST /api/reenviar-codigo
```
- **Body**:
  ```json
  {
    "correo": "string"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Nuevo código de verificación enviado",
    "correo": "usuario@ejemplo.com"
  }
  ```
- **Notas**:
  - Solo se puede reenviar si el código anterior ha expirado (5 minutos)
  - No se puede reenviar si el correo ya está validado
  - Se elimina el código anterior antes de generar uno nuevo
  - Se mantienen los datos temporales del registro
  - Se actualiza la fecha de expiración

### Validación de Código
```http
POST /api/validar-codigo
```
- **Body**:
  ```json
  {
    "correo": "string",
    "codigo": "string"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Usuario validado correctamente",
    "usuario": {
      "id": "number",
      "nombre": "string",
      "apellido": "string",
      "correo": "string",
      "rol": "number",
      "estado": "boolean"
    },
    "token": "string"
  }
  ```
- **Notas**:
  - El código debe ser ingresado dentro de los 5 minutos de expiración
  - Si el código es inválido o expirado, se elimina el registro temporal
  - Después de validar, se crea el usuario en la base de datos
  - Se eliminan los datos temporales
  - Se genera un token JWT para iniciar sesión

### Login
```http
POST /api/login
```
- **Body**:
  ```json
  {
    "correo": "string",
    "contrasena": "string"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "token": "string",
    "usuario": {
      "id": "number",
      "nombre": "string",
      "apellido": "string",
      "correo": "string",
      "rol": "number",
      "estado": "boolean"
    }
  }
  ```
- **Notas**:
  - Solo se puede hacer login después de validar el correo
  - El token expira en 2 horas
  - Se requiere el token para acceder a rutas protegidas

## Flujo de Registro y Verificación

1. **Registro Inicial**
   - Usuario envía datos de registro
   - Sistema valida campos y formato
   - Se envía código de verificación
   - Datos se guardan temporalmente
   - Código expira en 5 minutos

2. **Durante la Validación**
   - No se permite registrar el mismo correo
   - No se permite reenviar código hasta que expire
   - Se muestra tiempo restante para reenvío
   - Los datos temporales se mantienen

3. **Reenvío de Código**
   - Solo disponible después de 5 minutos
   - Elimina código anterior
   - Mantiene datos temporales
   - Actualiza fecha de expiración
   - Envía nuevo código

4. **Validación de Código**
   - Verifica código y expiración
   - Crea usuario en base de datos
   - Elimina datos temporales
   - Genera token JWT
   - Permite inicio de sesión

5. **Post Validación**
   - No se permite reenvío de código
   - No se permite nuevo registro
   - Se puede iniciar sesión
   - Se requiere token para operaciones

## Códigos de Error Comunes

- `400 Bad Request`:
  - "Todos los campos son obligatorios"
  - "Correo no válido"
  - "Contraseña insegura"
  - "Género no válido"
  - "Edad mínima de registro: 18 años"
  - "Código inválido o expirado"
  - "Datos de registro no encontrados"

- `401 Unauthorized`:
  - "Token inválido o expirado"
  - "No autorizado"

- `403 Forbidden`:
  - "No tiene permisos para realizar esta acción"

- `404 Not Found`:
  - "Usuario no encontrado"
  - "Código no encontrado"

- `500 Internal Server Error`:
  - "Error al enviar el correo de verificación"
  - "Error al crear el usuario"

## Notas de Seguridad

1. **Contraseñas**:
   - Mínimo 8 caracteres
   - Máximo 20 caracteres
   - Al menos una mayúscula
   - Al menos una minúscula
   - Al menos un número
   - Al menos un símbolo

2. **Tokens**:
   - Expiración de 2 horas
   - Incluye ID, correo y rol
   - Se requiere para rutas protegidas

3. **Validaciones**:
   - Correo único
   - Edad mínima 18 años
   - Género válido
   - Formato de fecha correcto

4. **Limpieza Automática**:
   - Códigos expirados se eliminan
   - Datos temporales se limpian
   - Registros inválidos se eliminan

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

### Obtener Comentarios (Redirección por Rol)
```http
GET /api/comentarios
```
- **Headers**: `Authorization: Bearer {token}`
- **Redirección por Rol**:
  - **Roles 1,2 (Admin/SuperAdmin)**: Ve todos los comentarios
  - **Rol 3 (Propietario)**: Ve solo comentarios de sus eventos
  - **Rol 8 (Usuario)**: Ve solo sus propios comentarios
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Comentarios obtenidos exitosamente",
    "comentarios": [
      {
        "id": 1,
        "contenido": "Comentario 1",
        "fecha_hora": "2024-02-20T15:30:00.000Z",
        "estado": true
      }
    ]
  }
  ```

### Crear Comentario (Rol 8)
```http
POST /api/comentario
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 8 (Usuario)
- **Body**:
  ```json
  {
    "eventoid": 1,
    "contenido": "Este es un comentario de ejemplo"
  }
  ```

### Actualizar Comentario (Rol 8, solo propietario del comentario)
```http
PUT /api/comentario/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 8 (Usuario)
- **Validación Adicional**: Solo puede actualizar sus propios comentarios
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
- **Roles Permitidos**: 1,2,8
- **Validación Adicional**: 
  - Roles 1,2 pueden eliminar cualquier comentario
  - Rol 8 solo puede eliminar sus propios comentarios

### Reportar Comentario (Rol 3)
```http
POST /api/propietario/comentario/:comentarioid/reporte
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Body**:
  ```json
  {
    "motivo_reporte": "Contenido inapropiado"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Solicitud registrada exitosamente",
    "datos": {
      "mensaje": "Solicitud enviada a administración",
      "comentario": {
        "id": 42,
        "contenido": "Contenido del comentario",
        "estado": true,
        "aprobacion": "pendiente",
        "motivo_reporte": "Contenido inapropiado",
        "fecha_reporte": "2024-03-21T15:30:00.000Z",
        "usuario": {
          "id": 1,
          "nombre": "Nombre Usuario"
        },
        "evento": {
          "id": 1,
          "nombre": "Nombre Evento"
        }
      }
    }
  }
  ```
- **Códigos de Error**:
  - `400`: Si el comentario ya está reportado o falta el motivo
  - `403`: Si el usuario no es propietario
  - `404`: Si el comentario no existe
  - `500`: Error interno del servidor

### Obtener Comentarios por Evento (Redirección por Rol)
```http
GET /api/comentarios/evento/:eventoid
```
- **Headers**: `Authorization: Bearer {token}`
- **Redirección por Rol**:
  - **Roles 1,2**: Ve todos los comentarios del evento
  - **Rol 3**: Ve solo comentarios de sus eventos
  - **Rol 8**: Ve todos los comentarios del evento

### Obtener Comentarios Reportados (Roles 1,2)
```http
GET /api/comentario/reportados
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2 (Admin/SuperAdmin)

## Calificaciones

### Listar Calificaciones (Todos los roles)
```http
GET /api/calificaciones?page={page}&limit={limit}
```
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `page`: Número de página (por defecto: 1)
  - `limit`: Cantidad de elementos por página (por defecto: 10)
  - `eventoid`: ID del evento (obligatorio para usuarios normales)
- **Roles permitidos**: 1 (SuperAdmin), 2 (Admin), 3 (Propietario), 8 (Usuario Normal)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Calificaciones obtenidas correctamente",
    "datos": {
      "total": 8,
      "calificaciones": [
        {
          "id": 27,
          "usuarioid": 48,
          "eventoid": 19,
          "puntuacion": 5,
          "estado": true,
          "createdAt": "2025-05-04T01:41:22.000Z",
          "usuario": {
            "nombre": "yonnier prueba 1"
          },
          "evento": {
            "nombre": "Concierto ",
            "lugar": {
              "nombre": "disco Arena Rose"
            }
          }
        }
      ],
      "paginas": 1,
      "paginaActual": 1
    }
  }
  ```
- **Notas**:
  - Admins (roles 1,2) ven todas las calificaciones.
  - Propietarios (rol 3) ven calificaciones de sus lugares.
  - Usuarios normales (rol 8) ven solo sus propias calificaciones.

### Listar Calificaciones por Lugar (Solo propietarios)
```http
GET /api/calificaciones/lugar/:lugarid?page={page}&limit={limit}
```
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `page`: Número de página (por defecto: 1)
  - `limit`: Cantidad de elementos por página (por defecto: 10)
- **Roles permitidos**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Calificaciones obtenidas correctamente",
    "datos": {
      "total": 8,
      "calificaciones": [
        {
          "id": 27,
          "usuarioid": 48,
          "eventoid": 19,
          "puntuacion": 5,
          "estado": true,
          "createdAt": "2025-05-04T01:41:22.000Z",
          "usuario": {
            "nombre": "yonnier prueba 1"
          },
          "evento": {
            "nombre": "Concierto ",
            "lugar": {
              "nombre": "disco Arena Rose"
            }
          }
        }
      ],
      "paginas": 1,
      "paginaActual": 1
    }
  }
  ```
- **Notas**:
  - Solo los propietarios pueden acceder a este endpoint.
  - El endpoint verifica que el lugar pertenece al propietario.
  - Devuelve todas las calificaciones de los eventos del lugar especificado.

### Eliminar Calificación (Roles 1,2,8)
```http
DELETE /api/calificacion/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2,8
- **Validación Adicional**: 
  - Roles 1,2 pueden eliminar cualquier calificación
  - Rol 8 solo puede eliminar sus propias calificaciones

## Reservas

### Listar Reservas (Roles 1,2,3,8)
```http
GET /api/reservas
```
- **Headers**: `Authorization: Bearer {token}`
- **Redirección por Rol**:
  - **Roles 1,2**: Ve todas las reservas
  - **Rol 3**: Ve reservas de sus eventos
  - **Rol 8**: Ve solo sus reservas

### Buscar Reserva por Número (Roles 1,2,3)
```http
GET /api/reserva/:numero_reserva
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2,3

### Eliminar Reserva (Roles 1,2)
```http
DELETE /api/reserva/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2 (Admin/SuperAdmin)

## Códigos de Estado

- `200`: OK - La solicitud se completó exitosamente
- `201`: Created - Recurso creado exitosamente
- `400`: Bad Request - La solicitud es inválida
- `401`: Unauthorized - No se proporcionó token o es inválido
- `403`: Forbidden - No tiene permisos para realizar la acción
- `404`: Not Found - El recurso no existe
- `500`: Internal Server Error - Error del servidor

## Notas Importantes

1. **Autenticación**
   - Todos los endpoints requieren autenticación mediante token JWT
   - El token debe incluir el rol del usuario

2. **Roles del Sistema**
   - 1: SuperAdmin - Acceso total
   - 2: Admin - Acceso casi total, algunas restricciones
   - 3: Propietario - Acceso a sus recursos y funcionalidades específicas
   - 8: Usuario - Acceso limitado a sus propios recursos

3. **Redirecciones por Rol**
   - Algunos endpoints muestran diferentes datos según el rol
   - Las redirecciones son automáticas basadas en el rol del token

4. **Validaciones Adicionales**
   - Además del rol, algunos endpoints tienen validaciones específicas
   - Por ejemplo, usuarios solo pueden modificar sus propios recursos 