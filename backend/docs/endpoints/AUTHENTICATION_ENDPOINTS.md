# Documentación de Endpoints de Autenticación

## Tabla de Contenidos
1. [Registro de Usuario](#registro-de-usuario)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Reenvío de Código de Verificación](#reenvío-de-código-de-verificación)
4. [Validación de Código](#validación-de-código)
5. [Recuperación de Contraseña](#recuperación-de-contraseña)
6. [Actualización de Contraseña](#actualización-de-contraseña)

---

## Registro de Usuario

Crea una nueva cuenta de usuario en el sistema. El proceso de registro incluye la validación de datos, verificación de correo electrónico y generación de un código de verificación.

### Endpoint
```
POST /api/auth/registrar
```

### Cuerpo de la Solicitud
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@ejemplo.com",
  "contrasena": "Contraseña123!",
  "fecha_nacimiento": "1990-01-01",
  "genero": "Masculino",
  "rolid": 4
}
```

### Validaciones
1. **Campos obligatorios**: Todos los campos son obligatorios excepto `rolid` (por defecto: 4 - Usuario Estándar).
2. **Formato de correo**: Debe ser un correo electrónico válido.
3. **Contraseña**:
   - Mínimo 8 caracteres, máximo 20
   - Al menos una letra mayúscula
   - Al menos una letra minúscula
   - Al menos un número
   - Al menos un símbolo
4. **Edad mínima**: 18 años
5. **Correo único**: No puede estar registrado previamente

### Flujo de Registro
1. El cliente envía los datos del formulario al endpoint `/api/auth/registrar`.
2. El servidor valida los datos recibidos.
3. Se verifica que el correo no esté registrado.
4. Se genera un código de verificación de 6 dígitos.
5. Se guarda temporalmente la información del usuario con estado inactivo.
6. Se envía un correo electrónico con el código de verificación.
7. El código expira después de 5 minutos.

### Respuestas

**Éxito (201 Created)**
```json
{
  "codigo": "REGISTRO_EXITOSO",
  "mensaje": "Registro exitoso. Por favor, verifica tu correo electrónico.",
  "correo": "juan.perez@ejemplo.com",
  "registroExitoso": true
}
```

**Error (400 Bad Request)**
```json
{
  "codigo": "VALIDACION_FALLIDA",
  "mensaje": "Error de validación en los datos",
  "detalles": "La contraseña debe incluir al menos un símbolo"
}
```

**Error (409 Conflict)**
```json
{
  "codigo": "CORREO_EN_USO",
  "mensaje": "El correo electrónico ya está registrado"
}
```

**Error (500 Internal Server Error)**
```json
{
  "codigo": "ERROR_SERVIDOR",
  "mensaje": "Error interno del servidor al procesar el registro"
}
```

## Inicio de Sesión

Autentica a un usuario y devuelve un token JWT para acceder a rutas protegidas.

### Endpoint
```
POST /api/auth/login
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

## Reenvío de Código de Verificación

Reenvía el código de verificación al correo electrónico proporcionado.

### Endpoint
```
POST /api/auth/reenviar-codigo
```

### Cuerpo de la Solicitud
```json
{
  "correo": "juan.perez@ejemplo.com"
}
```

## Validación de Código

Valida el código de verificación enviado al correo del usuario.

### Endpoint
```
POST /api/auth/validar-codigo
```

### Cuerpo de la Solicitud
```json
{
  "correo": "juan.perez@ejemplo.com",
  "codigo": "123456"
}
```

## Recuperación de Contraseña

Inicia el proceso de recuperación de contraseña.

### Endpoint
```
POST /api/auth/recuperar-contrasena
```

### Cuerpo de la Solicitud
```json
{
  "correo": "juan.perez@ejemplo.com"
}
```

## Actualización de Contraseña

Actualiza la contraseña del usuario.

### Endpoint
```
PATCH /api/auth/actualizar-contrasena
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
3. **Códigos de verificación**: Expiran después de 5 minutos.
4. **Límite de intentos**: Se recomienda implementar límites de intentos para prevenir ataques de fuerza bruta.

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
