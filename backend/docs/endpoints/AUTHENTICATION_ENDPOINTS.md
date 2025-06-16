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
POST /api/registrar
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
1. **Campos obligatorios**: 
   - `nombre`: Nombre del usuario
   - `apellido`: Apellido del usuario
   - `correo`: Correo electrónico válido
   - `contrasena`: Contraseña segura
   - `fecha_nacimiento`: Fecha en formato YYYY-MM-DD
   - `genero`: (Opcional) Género del usuario
   - `rolid`: (Opcional, por defecto: 4 - Usuario Estándar)

2. **Validaciones de formato**:
   - Correo electrónico válido
   - Contraseña:
     - Mínimo 8 caracteres, máximo 20
     - Al menos una letra mayúscula
     - Al menos una letra minúscula
     - Al menos un número
     - Al menos un símbolo
   - Edad mínima: 18 años
   - Formato de fecha: YYYY-MM-DD

3. **Validaciones de negocio**:
   - El correo no puede estar registrado previamente
   - El formato de la fecha debe ser válido

### Flujo de Registro
1. El cliente envía los datos del formulario al endpoint `/api/registrar`.
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

**Error (502 Bad Gateway) - Error de servidor de correo**
```json
{
  "codigo": "ERROR_CORREO",
  "mensaje": "Error de autenticación del servidor de correo",
  "detalles": "No se pudo autenticar con el servidor de correo. Por favor, intente más tarde.",
  "error": "Invalid login: 535-5.7.8 Username and Password not accepted"
}
```

**Error (504 Gateway Timeout) - Tiempo de espera agotado**
```json
{
  "codigo": "TIEMPO_AGOTADO",
  "mensaje": "Tiempo de espera agotado",
  "detalles": "El servidor no respondió a tiempo. Por favor, intente nuevamente."
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

## Reenvío de Código de Verificación

Reenvía el código de verificación al correo electrónico proporcionado.

### Endpoint
```
POST /api/reenviar-codigo
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
POST /api/validar-codigo
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
POST /api/recuperar-contrasena
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
