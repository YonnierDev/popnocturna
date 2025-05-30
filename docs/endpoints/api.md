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

### Actualizar Contraseña
```http
PATCH /api/actualizar-contrasena
```
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "nuevaContrasena": "string",
    "confirmarContrasena": "string"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Contraseña actualizada correctamente"
  }
  ```
- **Códigos de Error**:
  - `400`: "Las contraseñas no coinciden"
  - `400`: "La nueva contraseña no puede ser igual a la actual"
  - `400`: "Error al verificar la contraseña actual"
  - `401`: "Token inválido"
  - `401`: "El enlace de recuperación ha expirado"
  - `404`: "Usuario no encontrado"

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
POST /auth/login
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
      "correo": "string",
      "rolid": "number"
    }
  }
  ```

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

### Obtener Perfil
```http
GET /usuarios/perfil
```
- **Headers**: `Authorization: Bearer {token}`
- **Respuesta Exitosa**:
  ```json
  {
    "id": "number",
    "nombre": "string",
    "correo": "string",
    "rolid": "number",
    "imagen": "string"
  }
  ```

### Actualizar Perfil
```http
PUT /usuarios/perfil
```
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "nombre": "string",
    "imagen": "File"
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

### Actualizar Lugar
```http
PUT /api/lugar/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "usuarioid": "number",
    "categoriaid": "number",
    "nombre": "string",
    "descripcion": "string",
    "ubicacion": "string",
    "imagen": "file (opcional)"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Lugar actualizado con éxito",
    "lugar": {
      "id": 1,
      "nombre": "Nombre Actualizado",
      "descripcion": "Descripción actualizada",
      "ubicacion": "Nueva ubicación",
      "imagen": "url_imagen",
      "estado": true
    }
  }
  ```
- **Códigos de Error**:
  - `400`: Si el nombre ya está siendo utilizado por otro lugar
  - `404`: Si el lugar no existe
  - `500`: Error interno del servidor
- **Notas**:
  - El nombre del lugar debe ser único en el sistema
  - Se puede mantener el mismo nombre si no se modifica
  - La imagen es opcional, si no se envía se mantiene la actual
  - Se pueden actualizar uno o varios campos a la vez

## Comentarios

### Obtener Comentarios (Redirección por Rol)
```http
GET /api/comentarios
```
- **Headers**: `Authorization: Bearer {token}`
- **Redirección por Rol**:
  - **Roles 1,2 (Admin/SuperAdmin)**: Ve todos los comentarios
  - **Rol 3 (Propietario)**: Ve solo comentarios de sus eventos
  - **Rol 4 (Usuario)**: Ve solo sus propios comentarios
- **Respuestas por Rol**:
  ```json
  // Para Roles 1,2 (Admin/SuperAdmin)
  {
    "mensaje": "Lista de comentarios obtenida exitosamente (Vista de Administración)",
    "comentarios": [...]
  }

  // Para Rol 3 (Propietario)
  {
    "mensaje": "Comentarios de tus lugares obtenidos exitosamente (Vista de Propietario)",
    "comentarios": [...]
  }

  // Para Rol 4 (Usuario)
  {
    "mensaje": "Tus comentarios obtenidos exitosamente (Vista de Usuario)",
    "comentarios": [...]
  }
  ```
- **Notas**:
  - El mensaje de respuesta varía según el rol del usuario
  - Los datos mostrados también varían según el rol
  - Se requiere autenticación válida

### Crear Comentario (Rol 4)
```http
POST /api/comentario
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 4 (Usuario)
- **Body**:
  ```json
  {
    "eventoid": 1,
    "contenido": "Este es un comentario de ejemplo"
  }
  ```

### Actualizar Comentario (Rol 4, solo propietario del comentario)
```http
PUT /api/comentario/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 4 (Usuario)
- **Validación Adicional**: Solo puede actualizar sus propios comentarios
- **Body**:
  ```json
  {
    "contenido": "Comentario actualizado"
  }
  ```

### Eliminar Comentario (Roles 1,2,4)
```http
DELETE /api/comentario/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2,4
- **Validación Adicional**: 
  - Roles 1,2 pueden eliminar cualquier comentario
  - Rol 4 solo puede eliminar sus propios comentarios

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
  - **Rol 4**: Ve todos los comentarios del evento

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
- **Roles permitidos**: 1 (SuperAdmin), 2 (Admin), 3 (Propietario), 4 (Usuario Normal)
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
  - Usuarios normales (rol 4) ven solo sus propias calificaciones.

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

### Eliminar Calificación (Roles 1,2,4)
```http
DELETE /api/calificacion/:id
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2,4
- **Validación Adicional**: 
  - Roles 1,2 pueden eliminar cualquier calificación
  - Rol 4 solo puede eliminar sus propias calificaciones

## Reservas

### Listar Reservas (Roles 1,2,3,4)
```http
GET /api/reservas
```
- **Headers**: `Authorization: Bearer {token}`
- **Redirección por Rol**:
  - **Roles 1,2**: Ve todas las reservas
  - **Rol 3**: Ve reservas de sus eventos
  - **Rol 4**: Ve solo sus reservas

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
   - 4: Usuario - Acceso limitado a sus propios recursos

3. **Redirecciones por Rol**
   - Algunos endpoints muestran diferentes datos según el rol
   - Las redirecciones son automáticas basadas en el rol del token

4. **Validaciones Adicionales**
   - Además del rol, algunos endpoints tienen validaciones específicas
   - Por ejemplo, usuarios solo pueden modificar sus propios recursos 

## Endpoints del Propietario (Rol 3)

### Gestión de Lugares

#### Listar Lugares del Propietario
```http
GET /api/propietario/lugares
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Lugares obtenidos exitosamente",
    "lugares": [
      {
        "id": 1,
        "nombre": "Nombre Lugar",
        "direccion": "Dirección",
        "categoria": {
          "id": 1,
          "nombre": "Categoría"
        }
      }
    ]
  }
  ```

#### Crear Lugar
```http
POST /api/propietario/lugar
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Body**:
  ```json
  {
    "nombre": "string",
    "direccion": "string",
    "categoriaid": "number",
    "imagen": "file"
  }
  ```

#### Buscar Lugar por Nombre
```http
GET /api/propietario/lugar/:nombre
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)

#### Ver Comentarios y Calificaciones
```http
GET /api/propietario/lugar/:lugarid/comentarios-calificaciones
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Datos obtenidos exitosamente",
    "comentarios": [...],
    "calificaciones": [...]
  }
  ```

### Gestión de Categorías

#### Listar Categorías
```http
GET /api/propietario/categorias
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Categorías obtenidas exitosamente",
    "categorias": [
      {
        "id": 1,
        "nombre": "Categoría"
      }
    ]
  }
  ```

### Gestión de Eventos y Reservas

#### Listar Lugares con Eventos
```http
GET /api/propietario/lugares-eventos
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Lugares con eventos obtenidos exitosamente",
    "lugares": [
      {
        "id": "number",
        "nombre": "string",
        "eventos": [
          {
            "id": "number",
            "nombre": "string",
            "fecha": "string"
          }
        ]
      }
    ]
  }
  ```

#### Ver Reservas por Evento y Lugar
```http
GET /api/propietario/reservas-evento-lugar
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Reservas obtenidas exitosamente",
    "reservas": [
      {
        "id": "number",
        "numero_reserva": "string",
        "evento": {
          "nombre": "string",
          "fecha": "string"
        },
        "lugar": {
          "nombre": "string"
        }
      }
    ]
  }
  ```

#### Ver Reservas Pendientes
```http
GET /api/propietario/reservas/pendientes
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Reservas pendientes obtenidas exitosamente",
    "reservas": [
      {
        "id": 1,
        "numero_reserva": "string",
        "estado": "pendiente",
        "evento": {
          "nombre": "string",
          "fecha": "date"
        }
      }
    ]
  }
  ```

### Gestión de Comentarios

#### Reportar Comentario
```http
POST /api/propietario/comentario/:comentarioid/reporte
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Body**:
  ```json
  {
    "motivo_reporte": "string"
  }
  ```

### Gestión de Calificaciones

#### Ver Calificaciones por Lugar
```http
GET /api/calificaciones/lugar/:lugarid
```
- **Headers**: `Authorization: Bearer {token}`
- **Rol Requerido**: 3 (Propietario)
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Calificaciones obtenidas exitosamente",
    "calificaciones": [
      {
        "id": 1,
        "puntuacion": "number",
        "usuario": {
          "nombre": "string"
        }
      }
    ]
  }
  ```

## Eventos

### Listar Eventos Públicos
```http
GET /public/eventos
```
- **Query Parameters**:
  - `page`: número de página
  - `limit`: elementos por página
  - `categoria`: filtro por categoría
- **Respuesta Exitosa**:
  ```json
  {
    "total": "number",
    "pagina": "number",
    "porPagina": "number",
    "eventos": [
      {
        "id": "number",
        "nombre": "string",
        "descripcion": "string",
        "fecha": "string",
        "imagen": "string",
        "categoria": {
          "id": "number",
          "nombre": "string"
        }
      }
    ]
  }
  ```

### Listar Eventos (Autenticado)
```http
GET /api/eventos
```
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `page`: número de página (por defecto: 1)
  - `limit`: elementos por página (por defecto: 10)
  - `fechaDesde`: filtro por fecha inicial (opcional)
  - `fechaHasta`: filtro por fecha final (opcional)
- **Redirección por Rol**:
  - **Roles 1,2 (Admin/SuperAdmin)**: Ve todos los eventos sin restricción de estado
  - **Rol 3 (Propietario)**: Ve solo eventos activos de sus lugares
  - **Rol 4 (Usuario)**: Ve solo eventos activos
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Eventos obtenidos correctamente",
    "datos": [
      {
        "id": "number",
        "nombre": "string",
        "descripcion": "string",
        "fecha_hora": "date",
        "estado": "boolean",
        "lugar": {
          "id": "number",
          "nombre": "string",
          "ubicacion": "string",
          "descripcion": "string"
        },
        "comentarios": [
          {
            "id": "number",
            "contenido": "string",
            "fecha_hora": "date",
            "usuario": {
              "id": "number",
              "nombre": "string"
            }
          }
        ]
      }
    ]
  }
  ```
- **Notas**:
  - Los eventos se ordenan por fecha_hora de forma descendente
  - Los comentarios incluidos son solo los que tienen estado activo
  - La información del lugar varía según el rol del usuario

## Notificaciones

### Listar Notificaciones de Reportes
```http
GET /api/comentario/reportes/notificaciones
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2 (Admin/SuperAdmin)
- **Respuesta Exitosa**:
  ```json
  {
    "reportesPendientes": number,
    "mensaje": "Tienes X reporte(s) pendiente(s) de revisión"
  }
  ```

### Listar Notificaciones de Lugares
```http
GET /api/lugares/creacion/notificaciones
```
- **Headers**: `Authorization: Bearer {token}`
- **Roles Permitidos**: 1,2 (Admin/SuperAdmin)
- **Respuesta Exitosa**:
  ```json
  {
    "lugaresPendientes": number,
    "mensaje": "Tienes X lugar(es) pendiente(s) de aprobación"
  }
  ``` 