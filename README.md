# 🌃 Popayán Nocturna - Backend

## Descripción
Sistema backend para la plataforma Popayán Nocturna, desarrollado con Node.js y Express.

## Tecnologías
- Node.js
- Express
- Sequelize ORM
- JWT
- bcrypt
- Nodemailer
- Cloudinary
- Multer
- dotenv
- express-validator
- Railway (Base de datos)
- Vercel (Hosting)

## Estructura del Proyecto
```
backend/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
└── config/
```

## Funcionalidades Principales

### Autenticación y Registro
- Registro de usuarios con verificación por correo
- Código de verificación con expiración de 5 minutos
- Reenvío de código después de expiración
- Validación de correo electrónico
- Inicio de sesión con JWT
- Recuperación de contraseña
- Gestión de roles y permisos

### Flujo de Registro y Verificación

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

### Gestión de Usuarios
- Perfiles de usuario
- Actualización de datos
- Cambio de contraseña
- Gestión de estados

### Gestión de Contenido
- Carga y gestión de imágenes
- Validaciones de archivos
- Almacenamiento en Cloudinary

### API Modular
- Endpoints organizados por funcionalidad
- Validaciones de datos
- Manejo de errores
- Documentación de API

### Seguridad
- Autenticación JWT
- Encriptación de contraseñas
- Validación de tokens
- Control de acceso basado en roles
- Limpieza automática de datos temporales
- Protección contra registros duplicados

### Notificaciones
- Envío de correos electrónicos
- Verificación de correo
- Recuperación de contraseña
- Notificaciones del sistema

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno
4. Ejecutar migraciones: `npm run migrate`
5. Iniciar servidor: `npm start`

## Variables de Entorno
```
DB_HOST=railway.proxy.rlwy.net
DB_USER=root
DB_PASS=tu_contraseña_railway
DB_NAME=railway
JWT_SECRET=tu_jwt_secret
EMAIL_USER=tu_email
EMAIL_PASS=tu_password_email
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Scripts
- `npm start`: Inicia el servidor
- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run migrate`: Ejecuta las migraciones
- `npm test`: Ejecuta las pruebas

## Documentación
La documentación completa de la API se encuentra en la carpeta `docs/`.

## Contribución
1. Fork el repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT.

# Sistema de Calificaciones - PopNocturna

## Descripción
Sistema de gestión de calificaciones para eventos, implementando control de acceso basado en roles.

## Roles y Permisos

### Administradores (roles 1 y 2)
- Pueden ver todas las calificaciones
- Pueden crear, actualizar y eliminar cualquier calificación
- Pueden cambiar el estado de las calificaciones

### Propietarios (rol 3)
- Solo pueden ver las calificaciones de sus eventos
- No pueden crear calificaciones
- No pueden actualizar calificaciones
- No pueden eliminar calificaciones
- No pueden cambiar el estado de las calificaciones

### Usuarios Normales (rol 4)
- Pueden ver todas las calificaciones
- Pueden crear calificaciones
- Solo pueden actualizar sus propias calificaciones
- Solo pueden eliminar sus propias calificaciones
- No pueden cambiar el estado de las calificaciones

## Endpoints

### Listar Calificaciones
- **GET** `/calificaciones`
- Permisos: Todos los roles
- Paginación: Sí
- Filtros: Por rol del usuario

### Ver Calificación
- **GET** `/calificaciones/:id`
- Permisos: 
  - Admins: Cualquier calificación
  - Propietarios: Solo calificaciones de sus eventos
  - Usuarios: Sus propias calificaciones

### Crear Calificación
- **POST** `/calificaciones`
- Permisos: Admins y usuarios normales
- Validaciones:
  - Puntuación entre 1 y 5
  - Usuario no puede ser propietario

### Actualizar Calificación
- **PUT** `/calificaciones/:id`
- Permisos:
  - Admins: Cualquier calificación
  - Usuarios: Solo sus propias calificaciones
- Validaciones:
  - Puntuación entre 1 y 5
  - Usuario no puede ser propietario

### Eliminar Calificación
- **DELETE** `/calificaciones/:id`
- Permisos:
  - Admins: Cualquier calificación
  - Usuarios: Solo sus propias calificaciones
- Validaciones:
  - Usuario no puede ser propietario

### Cambiar Estado de Calificación
- **PUT** `/calificaciones/:id/estado`
- Permisos: Solo administradores
- Validaciones: Estado debe ser booleano

## Estructura del Proyecto

```
backend/
├── controllers/
│   └── calificacionController.js
├── service/
│   └── calificacionService.js
└── models/
    └── Calificacion.js
```

## Logs y Diagnóstico
El sistema implementa logs detallados para:
- Verificación de roles
- Operaciones de CRUD
- Validaciones de permisos
- Errores y excepciones

## Ejemplos de Respuestas

### Éxito
```json
{
  "mensaje": "Calificación eliminada correctamente"
}
```

### Error de Permisos
```json
{
  "error": "Los propietarios no tienen permiso para eliminar calificaciones",
  "rol": 3
}
```

### Error de Validación
```json
{
  "error": "La puntuación debe estar entre 1 y 5"
}
```

# Sistema de Reportes y Notificaciones

## Endpoints de Reportes

### Reportes de Comentarios
- `GET /api/reportes/comentarios/pendientes`
  - Descripción: Lista los comentarios reportados pendientes de revisión
  - Roles permitidos: 1 (Super Admin), 2 (Admin)
  - Respuesta exitosa:
    ```json
    {
      "mensaje": "Reportes pendientes obtenidos exitosamente",
      "reportes": [
        {
          "id": 1,
          "contenido": "Contenido del comentario",
          "aprobacion": "pendiente",
          "usuario": {
            "id": 1,
            "nombre": "Nombre Usuario",
            "correo": "usuario@ejemplo.com"
          },
          "evento": {
            "id": 1,
            "nombre": "Nombre Evento",
            "fecha_hora": "2024-02-20T15:00:00Z"
          }
        }
      ]
    }
    ```

- `PUT /api/reporte/comentario/:id/estado`
  - Descripción: Actualiza el estado de un comentario reportado
  - Roles permitidos: 1, 2
  - Body requerido:
    ```json
    {
      "aprobacion": "aceptado|rechazado",
      "motivo": "Motivo de la decisión"
    }
    ```

- `POST /api/comentario/:id/reportar`
  - Descripción: Reporta un comentario
  - Roles permitidos: 3 (Propietario)
  - Body requerido:
    ```json
    {
      "motivo": "Motivo del reporte"
    }
    ```

### Notificaciones
- `GET /api/reportes/notificaciones`
  - Descripción: Obtiene notificaciones de reportes pendientes
  - Roles permitidos: 1, 2
  - Respuesta exitosa:
    ```json
    {
      "reportesPendientes": 5,
      "mensaje": "Tienes 5 reporte(s) pendiente(s) de revisión"
    }
    ```

- `GET /api/lugares/notificaciones`
  - Descripción: Obtiene notificaciones de lugares pendientes
  - Roles permitidos: 1, 2
  - Respuesta exitosa:
    ```json
    {
      "lugaresPendientes": 3,
      "mensaje": "Tienes 3 lugar(es) pendiente(s) de aprobación"
    }
    ```

### Lugares Pendientes
- `GET /api/lugares/pendientes`
  - Descripción: Lista los lugares pendientes de aprobación
  - Roles permitidos: 1, 2
  - Respuesta exitosa:
    ```json
    {
      "mensaje": "Lugares pendientes obtenidos exitosamente",
      "lugares": [
        {
          "id": 1,
          "nombre": "Nombre Lugar",
          "descripcion": "Descripción del lugar",
          "ubicacion": "Ubicación del lugar",
          "usuario": {
            "id": 1,
            "nombre": "Nombre Propietario",
            "correo": "propietario@ejemplo.com"
          },
          "categoria": {
            "id": 1,
            "tipo": "Tipo de Categoría"
          }
        }
      ]
    }
    ```

- `PUT /api/lugar/:id/estado`
  - Descripción: Actualiza el estado de un lugar
  - Roles permitidos: 1, 2
  - Body requerido:
    ```json
    {
      "estado": true|false
    }
    ```

## Flujo de Estados

### Comentarios Reportados
1. Estado inicial: "pendiente"
2. Si se acepta:
   - El comentario se oculta de las vistas públicas
   - Solo visible para roles 1, 2 y 3
3. Si se rechaza:
   - El comentario permanece visible
   - Se mantiene como si no hubiera sido reportado

### Lugares
1. Estado inicial: `aprobacion: false`
2. Al aprobar: `aprobacion: true`
3. Al rechazar: Se mantiene en `false`

## Mensajes de Error Comunes
- 403: "No tienes permisos para realizar esta acción"
- 400: "Ya existe una solicitud de reporte en revisión"
- 400: "Este comentario ya fue revisado anteriormente"
- 500: "Error al procesar la solicitud"

## Endpoints del Propietario (Rol 3)

### Gestión de Lugares
- `GET /api/propietario/lugares` - Listar lugares del propietario
- `POST /api/propietario/lugar` - Crear nuevo lugar
- `GET /api/propietario/lugar/:nombre` - Buscar lugar por nombre
- `GET /api/propietario/lugar/:lugarid/comentarios-calificaciones` - Ver comentarios y calificaciones de un lugar

### Gestión de Categorías
- `GET /api/propietario/categorias` - Listar categorías disponibles

### Gestión de Eventos y Reservas
- `GET /api/propietario/lugares-eventos` - Listar lugares con sus eventos
- `GET /api/propietario/reservas-evento-lugar` - Ver reservas por evento y lugar
- `GET /api/propietario/reservas/pendientes` - Ver reservas pendientes
- `GET /api/reservasdetalle` - Ver detalles de reservas

### Gestión de Comentarios
- `POST /api/propietario/comentario/:comentarioid/reporte` - Reportar comentario

### Gestión de Calificaciones
- `GET /api/calificaciones/lugar/:lugarid` - Ver calificaciones de un lugar

## Despliegue

### Railway (Base de Datos)
1. Crear cuenta en Railway
2. Crear nuevo proyecto MySQL
3. Obtener credenciales de conexión
4. Configurar variables de entorno

### Vercel (Backend)
1. Crear cuenta en Vercel
2. Conectar repositorio
3. Configurar variables de entorno
4. Desplegar
