# Documentación de Endpoints de Autenticación

## Tabla de Contenidos
1. [Registro de Propietario](#registro-de-propietario)
2. [Registro de Usuario](#registro-de-usuario)
3. [Inicio de Sesión](#inicio-de-sesión)
4. [Recuperación de Contraseña](#recuperación-de-contraseña)
5. [Actualización de Contraseña](#actualización-de-contraseña)

---

## Registro de Propietario

Crea una nueva cuenta de propietario en el sistema. Este endpoint asigna automáticamente el rol de propietario (rolid: 3) al nuevo usuario. El proceso de registro es inmediato y no requiere validación de correo electrónico.

## Registro de Usuario

Crea una nueva cuenta de usuario estándar en el sistema. Este endpoint asigna automáticamente el rol de usuario (rolid: 4). El proceso de registro es inmediato y no requiere validación de correo electrónico.

### Endpoint para Propietario
```
POST /api/registrar
```

### Endpoint para Usuario
```
POST /api/registrar-usuario
```

### Cuerpo de la Solicitud
Ambos endpoints aceptan el mismo formato de solicitud:

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@ejemplo.com",
  "contrasena": "Contraseña123!",
  "fecha_nacimiento": "1990-01-01",
  "genero": "Masculino"
}
```

**Nota**: El campo `rolid` es ignorado si se envía, ya que se asigna automáticamente según el endpoint utilizado (3 para propietario, 4 para usuario).

### Validaciones
1. **Campos obligatorios**: 
   - `nombre`: Nombre del usuario
   - `apellido`: Apellido del usuario
   - `correo`: Correo electrónico válido
   - `contrasena`: Contraseña segura
   - `fecha_nacimiento`: Fecha en formato YYYY-MM-DD
   - `genero`: (Opcional) Género del usuario

2. **Validaciones de formato**:
   - Correo electrónico válido
   - Contraseña:
     - Mínimo 8 caracteres, máximo 20
     - Al menos una letra mayúscula
     - Al menos una letra minúscula
     - Al menos un número
     - Al menos un símbolo

3. **Validaciones de negocio**:
   - El correo no puede estar registrado previamente
   - El formato de la fecha debe ser válido
   - El usuario se crea directamente con estado activo

### Respuestas

**Éxito (201 Created) - Registro de Propietario**
```json
{
  "codigo": "REGISTRO_EXITOSO",
  "mensaje": "Registro exitoso",
  "registroExitoso": true,
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan.perez@ejemplo.com",
    "rol": 3,
    "estado": true
  }
}
```

**Éxito (201 Created) - Registro de Usuario**
```json
{
  "codigo": "REGISTRO_EXITOSO",
  "mensaje": "Registro de usuario exitoso",
  "registroExitoso": true,
  "usuario": {
    "id": 2,
    "nombre": "María",
    "apellido": "González",
    "correo": "maria.gonzalez@ejemplo.com",
    "rol": 4,
    "estado": true
  }
}
```

**Error (422 Unprocessable Entity) - Validación fallida**
```json
{
  "codigo": "VALIDACION_FALLIDA",
  "mensaje": "Error de validación en los datos del formulario",
  "detalles": "El campo 'nombre' es obligatorio"
}
```

**Error (409 Conflict) - Correo duplicado**
```json
{
  "codigo": "CORREO_DUPLICADO",
  "mensaje": "El correo electrónico ya está registrado",
  "detalles": "El correo juan.perez@ejemplo.com ya está en uso"
}
```



**Error (500 Internal Server Error) - Error inesperado**
```json
{
  "codigo": "ERROR_INTERNO",
  "mensaje": "Error interno del servidor",
  "detalles": "Ocurrió un error inesperado al procesar la solicitud"
}
```

**Error (400 Bad Request) - Datos incompletos**
```json
{
  "codigo": "DATOS_INCOMPLETOS",
  "mensaje": "Correo y contraseña son obligatorios"
}
```

## Inicio de Sesión

Autentica a un usuario y devuelve un token JWT para acceder a rutas protegidas.

### Endpoint
```
POST /api/login
```

### Cuerpo de la Solicitud
```json
{
  "correo": "juan.perez@ejemplo.com",
  "contrasena": "Contraseña123!"
}
```

### Respuesta Exitosa (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "correo": "juan.perez@ejemplo.com",
    "rol": "Usuario Estándar"
  }
}
```



## Recuperación de Contraseña

Inicia el proceso de recuperación de contraseña. En lugar de enviar un correo electrónico, devuelve un token de recuperación que puede ser usado para cambiar la contraseña.

### Endpoint
```
POST /api/recuperar-contrasena
```

### Cuerpo de la Solicitud
```json
{
  "correo": "juan.perez@ejemplo.com"
}
```

### Respuesta Exitosa
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mensaje": "Token generado para recuperación de contraseña"
}
```

### Respuesta de Error
```json
{
  "codigo": "USUARIO_NO_ENCONTRADO",
  "mensaje": "Usuario no encontrado"
}
```

## Actualización de Contraseña

Actualiza la contraseña del usuario.

### Endpoint
```
PATCH /api/actualizar-contrasena
```

### Cuerpo de la Solicitud
```json
{
  "token": "token-de-recuperacion",
  "nuevaContrasena": "NuevaContraseña123!"
}
```

---

## Consideraciones de Seguridad

1. **Contraseñas**: Las contraseñas se almacenan con hash bcrypt.
2. **Tokens JWT**: Tienen un tiempo de expiración y firma segura.
3. **Límite de intentos**: Se recomienda implementar límites de intentos para prevenir ataques de fuerza bruta.

## Manejo de Errores

Todos los endpoints siguen un formato estándar de respuesta de error:

```json
{
  "codigo": "CODIGO_DEL_ERROR",
  "mensaje": "Descripción amigable del error",
  "detalles": "Información adicional opcional"
}
```

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en los datos de la solicitud
- `401 Unauthorized`: No autorizado
- `403 Forbidden`: Prohibido (sin permisos)
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej. correo ya registrado)
- `422 Unprocessable Entity`: Error de validación
- `500 Internal Server Error`: Error del servidor
