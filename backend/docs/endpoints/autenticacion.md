# Documentación de Endpoints - Autenticación

## Tabla de Contenidos
- [Registrar Usuario](#registrar-usuario)
- [Iniciar Sesión](#iniciar-sesión)
- [Solicitar Recuperación de Contraseña](#solicitar-recuperación-de-contraseña)
- [Validar Código de Verificación](#validar-código-de-verificación)
- [Reenviar Código de Verificación](#reenviar-código-de-verificación)
- [Actualizar Contraseña](#actualizar-contraseña)

---

## Registrar Usuario

### `POST /api/registrar`

Registra un nuevo usuario en el sistema y envía un código de verificación por correo electrónico.

#### Body de la Petición
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@ejemplo.com",
  "fecha_nacimiento": "1990-01-01",
  "contrasena": "Contraseña123!",
  "genero": "Masculino"
}
```

#### Respuesta Exitosa (201)
```json
{
  "mensaje": "Registro iniciado. Por favor, verifica tu correo electrónico.",
  "correo": "juan@ejemplo.com"
}
```

#### Posibles Errores
- `400`: Campos faltantes o inválidos
- `400`: Correo ya está en uso
- `400`: Código de verificación ya enviado (debe esperar 5 minutos)
- `500`: Error al enviar el correo de verificación

---

## Iniciar Sesión

### `POST /api/login`

Inicia sesión con correo y contraseña.

#### Body de la Petición
```json
{
  "correo": "juan@ejemplo.com",
  "contrasena": "Contraseña123!"
}
```

#### Respuesta Exitosa (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "correo": "juan@ejemplo.com",
    "rol": "usuario"
  }
}
```

#### Posibles Errores
- `400`: Credenciales inválidas
- `400`: Usuario no verificado
- `404`: Usuario no encontrado

---

## Solicitar Recuperación de Contraseña

### `POST /api/recuperar-contrasena`

Envía un correo con un enlace para restablecer la contraseña.

#### Body de la Petición
```json
{
  "correo": "juan@ejemplo.com"
}
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Se ha enviado un correo con las instrucciones para restablecer tu contraseña"
}
```

#### Posibles Errores
- `400`: Correo no registrado
- `500`: Error al enviar el correo

---

## Validar Código de Verificación

### `POST /api/validar-codigo`

Valida el código de verificación enviado al correo del usuario.

#### Body de la Petición
```json
{
  "correo": "juan@ejemplo.com",
  "codigo": "123456"
}
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Usuario validado correctamente"
}
```

#### Posibles Errores
- `400`: Código inválido o expirado
- `404`: No hay un registro pendiente para este correo

---

## Reenviar Código de Verificación

### `POST /api/reenviar-codigo`

Reenvía el código de verificación al correo del usuario.

#### Body de la Petición
```json
{
  "correo": "juan@ejemplo.com"
}
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Nuevo código de verificación enviado",
  "correo": "juan@ejemplo.com"
}
```

#### Posibles Errores
- `400`: No hay un registro pendiente para este correo
- `400`: Debes esperar X minutos antes de solicitar un nuevo código
- `500`: Error al enviar el correo

---

## Actualizar Contraseña

### `PATCH /api/actualizar-contrasena`

Actualiza la contraseña del usuario. Requiere autenticación con token JWT.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body de la Petición
```json
{
  "nuevaContrasena": "NuevaContraseña123!",
  "confirmarContrasena": "NuevaContraseña123!"
}
```

#### Respuesta Exitosa (200)
```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

#### Posibles Errores
- `400`: Las contraseñas no coinciden
- `400`: La nueva contraseña no puede ser igual a la actual
- `401`: No autorizado (token inválido o expirado)
- `400`: La contraseña no cumple con los requisitos de seguridad

---

## Requisitos de Contraseña

La contraseña debe cumplir con los siguientes requisitos:
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial (ej: !@#$%^&*)

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Creado - Recurso creado exitosamente |
| 400 | Solicitud incorrecta - Datos inválidos |
| 401 | No autorizado - Token inválido o faltante |
| 403 | Prohibido - Sin permisos suficientes |
| 404 | No encontrado - Recurso no existe |
| 500 | Error interno del servidor |
