# 📚 Documentación de Endpoints - Popayán Nocturna

## 🔐 Autenticación

### Login
- **POST** `/auth/login`
- **Descripción**: Inicio de sesión de usuarios
- **Body**:
```json
{
  "correo": "string",
  "contrasena": "string"
}
```
- **Respuesta**:
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

### Registro
- **POST** `/api/registrar`
- **Descripción**: Registro de nuevos usuarios con verificación por correo
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
- **Respuesta**:
```json
{
  "mensaje": "Registro iniciado. Por favor, verifica tu correo electrónico.",
  "correo": "usuario@ejemplo.com"
}
```
- **Notas**:
  - Se envía código de verificación al correo
  - Código expira en 5 minutos
  - No permite registro duplicado durante validación

### Reenvío de Código
- **POST** `/api/reenviar-codigo`
- **Descripción**: Solicita un nuevo código de verificación
- **Body**:
```json
{
  "correo": "string"
}
```
- **Respuesta**:
```json
{
  "mensaje": "Nuevo código de verificación enviado",
  "correo": "usuario@ejemplo.com"
}
```
- **Notas**:
  - Solo disponible si el código anterior expiró
  - No disponible para correos ya validados

### Validación de Código
- **POST** `/api/validar-codigo`
- **Descripción**: Valida el código de verificación y completa el registro
- **Body**:
```json
{
  "correo": "string",
  "codigo": "string"
}
```
- **Respuesta**:
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

## 👥 Usuarios

### Obtener Perfil
- **GET** `/usuarios/perfil`
- **Descripción**: Obtener información del usuario autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**:
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
- **PUT** `/usuarios/perfil`
- **Descripción**: Actualizar información del usuario
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "nombre": "string",
  "imagen": "File"
}
```

## 🌃 Eventos

### Listar Eventos
- **GET** `/eventos`
- **Descripción**: Obtener lista de eventos
- **Query Params**:
  - `page`: número de página
  - `limit`: elementos por página
  - `categoria`: filtro por categoría
- **Respuesta**:
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

### Crear Evento
- **POST** `/eventos`
- **Descripción**: Crear nuevo evento
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "nombre": "string",
  "descripcion": "string",
  "fecha": "string",
  "categoriaid": "number",
  "imagen": "File"
}
```

## ⭐ Calificaciones

### Listar Calificaciones
- **GET** `/calificaciones`
- **Descripción**: Obtener lista de calificaciones según rol
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**:
  - `page`: número de página
  - `limit`: elementos por página
- **Permisos**:
  - Admin: todas las calificaciones
  - Propietario: calificaciones de sus eventos
  - Usuario: sus propias calificaciones

### Crear Calificación
- **POST** `/calificaciones`
- **Descripción**: Crear nueva calificación
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "eventoid": "number",
  "puntuacion": "number"
}
```
- **Validaciones**:
  - Puntuación entre 1 y 5
  - Usuario no puede ser propietario

## 💬 Comentarios

### Listar Comentarios
- **GET** `/comentarios`
- **Descripción**: Obtener lista de comentarios
- **Query Params**:
  - `eventoid`: filtro por evento
  - `page`: número de página
  - `limit`: elementos por página

### Crear Comentario
- **POST** `/comentarios`
- **Descripción**: Crear nuevo comentario
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "eventoid": "number",
  "contenido": "string"
}
```

## 📝 Reservas

### Listar Reservas
- **GET** `/reservas`
- **Descripción**: Obtener lista de reservas
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**:
  - `page`: número de página
  - `limit`: elementos por página

### Crear Reserva
- **POST** `/reservas`
- **Descripción**: Crear nueva reserva
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "eventoid": "number",
  "fecha": "string",
  "cantidad": "number"
}
```

## 🔔 Notificaciones

- Antiguas rutas de notificaciones simplificadas se reemplazan por las siguientes:

### HTTP
#### Listar notificaciones de reportes
- **GET** `/api/comentario/reportes/notificaciones`
- **Descripción**: Cantidad de comentarios reportados pendientes de revisión
- **Permisos**: roles 1 y 2
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**:
```json
{
  "reportesPendientes": number,
  "mensaje": "Tienes X reporte(s) pendiente(s) de revisión"
}
```

#### Listar notificaciones de lugares
- **GET** `/api/lugares/creacion/notificaciones`
- **Descripción**: Cantidad de lugares pendientes de aprobación
- **Permisos**: roles 1 y 2
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**:
```json
{
  "lugaresPendientes": number,
  "mensaje": "Tienes X lugar(es) pendiente(s) de aprobación"
}
```

### Socket.IO (Tiempo Real)
#### Evento: `nuevo-lugar`
- **Descripción**: Se emite cuando un propietario (rol 3) crea un nuevo lugar
- **Payload**:
```json
{
  "propietario": "string",
  "lugar": { /* objeto lugar creado */ },
  "timestamp": "string (ISO 8601)"
}
```
- **Escucha en cliente**:
```js
socket.on('nuevo-lugar', data => {
  console.log('📍 Nuevo lugar:', data);
});
```

## 🎁 Recompensas

### Listar Recompensas
- **GET** `/recompensas`
- **Descripción**: Obtener lista de recompensas disponibles
- **Headers**: `Authorization: Bearer <token>`

### Canjear Recompensa
- **POST** `/recompensas/:id/canjear`
- **Descripción**: Canjear una recompensa
- **Headers**: `Authorization: Bearer <token>`

## 📊 Dashboard

### Estadísticas Generales
- **GET** `/dashboard/estadisticas`
- **Descripción**: Obtener estadísticas generales
- **Headers**: `Authorization: Bearer <token>`
- **Permisos**: Solo administradores

### Estadísticas por Evento
- **GET** `/dashboard/eventos/:id/estadisticas`
- **Descripción**: Obtener estadísticas de un evento
- **Headers**: `Authorization: Bearer <token>`
- **Permisos**: Administradores y propietarios del evento

## 🔒 Códigos de Estado

- `200`: OK
- `201`: Creado
- `400`: Solicitud incorrecta
- `401`: No autorizado
- `403`: Prohibido
- `404`: No encontrado
- `500`: Error del servidor

## 📝 Notas para Frontend

1. **Autenticación**:
   - Guardar token en localStorage/sessionStorage
   - Incluir token en headers: `Authorization: Bearer <token>`
   - Manejar expiración del token

2. **Paginación**:
   - Implementar paginación en todas las listas
   - Usar query params: `page` y `limit`

3. **Manejo de Errores**:
   - Mostrar mensajes de error amigables
   - Manejar códigos de estado HTTP
   - Implementar reintentos para errores 500

4. **Carga de Archivos**:
   - Usar FormData para subir imágenes
   - Mostrar previsualización antes de subir
   - Manejar tipos y tamaños de archivo

5. **Roles y Permisos**:
   - Ocultar/mostrar funcionalidades según rol
   - Validar permisos antes de acciones
   - Manejar redirecciones según rol

## 🔄 Flujos de Trabajo

1. **Registro y Login**:
   - Validar correo único
   - Enviar correo de verificación
   - Redirigir según rol después de login

2. **Reservas**:
   - Verificar disponibilidad
   - Calcular puntos de recompensa
   - Enviar confirmación por correo

3. **Calificaciones**:
   - Validar puntuación
   - Verificar permisos por rol
   - Actualizar promedio del evento

4. **Notificaciones**:
   - Marcar como leídas
   - Actualizar contador en tiempo real
   - Filtrar por tipo y estado 

## 🔄 Flujos de Registro

1. **Registro Inicial**
   - Usuario envía datos de registro
   - Sistema valida campos
   - Se envía código de verificación
   - Datos se guardan temporalmente

2. **Validación de Correo**
   - Usuario recibe código por correo
   - Código expira en 5 minutos
   - Se puede solicitar nuevo código después de expiración

3. **Completar Registro**
   - Usuario ingresa código recibido
   - Sistema valida código
   - Se crea usuario en base de datos
   - Se genera token JWT

4. **Inicio de Sesión**
   - Usuario puede iniciar sesión
   - Sistema valida credenciales
   - Se genera nuevo token JWT

## 🔄 Flujos de Recuperación

1. **Recuperación de Contraseña**
   - Usuario solicita recuperación de contraseña
   - Sistema valida correo
   - Se envía correo de recuperación

2. **Verificación de Token**
   - Usuario recibe token de recuperación
   - Sistema valida token
   - Se permite actualizar contraseña

3. **Actualización de Contraseña**
   - Usuario actualiza contraseña
   - Sistema valida actualización
   - Se actualiza contraseña en base de datos

## 🔄 Flujos de Notificaciones

1. **Notificaciones de Reportes**
   - Sistema notifica comentarios reportados
   - Sistema actualiza contador de reportes pendientes

2. **Notificaciones de Lugares**
   - Sistema notifica lugares pendientes de aprobación
   - Sistema actualiza contador de lugares pendientes

3. **Notificaciones de Eventos**
   - Sistema notifica eventos nuevos o actualizados
   - Sistema actualiza lista de eventos

## 🔄 Flujos de Recompensas

1. **Recompensas Disponibles**
   - Sistema muestra recompensas disponibles
   - Sistema actualiza lista de recompensas

2. **Canje de Recompensas**
   - Usuario selecciona recompensa
   - Sistema valida canje
   - Sistema actualiza stock de recompensas
   - Sistema notifica canje exitoso

## 🔄 Flujos de Dashboard

1. **Estadísticas Generales**
   - Sistema muestra estadísticas generales
   - Sistema actualiza gráficos y métricas

2. **Estadísticas por Evento**
   - Sistema muestra estadísticas de un evento
   - Sistema actualiza gráficos y métricas del evento

## 🔄 Flujos de Códigos de Estado

1. **Códigos de Estado**
   - Sistema muestra códigos de estado HTTP
   - Sistema actualiza mensajes de estado

2. **Códigos de Error**
   - Sistema muestra códigos de error
   - Sistema actualiza mensajes de error

## 🔄 Flujos de Notas para Frontend

1. **Notas para Frontend**
   - Sistema muestra notas para desarrolladores frontend
   - Sistema actualiza documentación y guías de desarrollo

2. **Notas para Usuarios**
   - Sistema muestra notas para usuarios finales
   - Sistema actualiza guías de uso y consejos 