# 🌃 Popayán Nocturna - Backend

Backend del sistema **Popayán Nocturna**, una plataforma para la gestión de lugares turísticos y experiencias nocturnas en la ciudad de Popayán. Este sistema permite a los usuarios registrarse, reservar lugares, ganar recompensas y recibir notificaciones, todo administrado mediante roles y un panel de control completo.

---

## 🚀 Tecnologías

- **Node.js** + **Express** – API RESTful
- **Sequelize ORM** – Conexión a MySQL
- **JWT** – Autenticación segura
- **bcrypt** – Encriptación de contraseñas
- **Nodemailer** – Envío de correos (verificación y recuperación)
- **Cloudinary** – Gestión de imágenes
- **Multer** – Carga de archivos
- **dotenv** – Variables de entorno
- **express-validator** – Validaciones robustas
- **Clever Cloud** – Hosting de base de datos MySQL
- **Vercel** – Despliegue del backend

---

## 📁 Estructura del Proyecto

```bash
📦backend-popayan-nocturna
├── 📂controllers       # Lógica de negocio por entidad
├── 📂middlewares       # Validaciones, JWT, roles y multer
├── 📂models            # Modelos de Sequelize
├── 📂routes            # Definición de endpoints
├── 📂service           # Lógica desacoplada y reusable
├── 📂config            # Conexión DB, cloudinary, Multer
├── 📄.env              # Variables de entorno
├── 📄index.js          # Inicio del servidor

---

## 🧠 Funcionalidades principales

✅ Autenticación con validación de correo  
✅ Gestión de usuarios y roles (super admin, admin, propietario, usuario)  
✅ Subida de imágenes con Cloudinary  
✅ Validaciones con `express-validator`  
✅ API REST modular  
✅ Control de acceso por middleware  
✅ Reservas, comentarios, lugares, categorías y recompensas  
✅ Envío de notificaciones por correo  
✅ Soporte para múltiples dashboards (admin y propietario)

---

## 🛠️ Instalación local

1. **Clona el repositorio**

```bash
git clone https://github.com/tuUsuario/backend-popayan-nocturna.git
cd popnocturna/backend
```

2. **Instala dependencias**

```bash
npm install
```

3. **Configura tu entorno**

Crea un archivo `.env` basado en `.env.example` con tus credenciales:

```env
PORT=3000
DB_HOST=tu_host_clevercloud
DB_NAME=popayan
DB_USER=usuario
DB_PASS=contraseña
JWT_SECRET=tu_clave_secreta
EMAIL_USER=correo@gmail.com
EMAIL_PASS=contraseña
CLOUDINARY_NAME=nombre
CLOUDINARY_KEY=clave
CLOUDINARY_SECRET=secreto
```

4. **Inicia el servidor**

```bash
npm run dev
```

---

## 🧪 Scripts útiles

```bash
npm start - Backend
npm run dev - Frontend

```

---


## 🔒 Seguridad

- Hashing de contraseñas con `bcrypt`
- Tokens JWT firmados y validados en cada request
- Roles con permisos controlados por middleware
- Validaciones de datos exhaustivas en entrada

---

## 📦 Despliegue

- **API desplegada en Vercel**
- **Base de datos MySQL en Clever Cloud**
- **Frontend desplegado en Vercel**
- Configuración automática de variables de entorno en Vercel

---

## 👥 Colaboradores

- Yonnier (Backend & Scrum Master)
- Marlon (Frontend)
- Camilo (Frontend)
- Jhoan (Fronted)
- Cristian (Fronted)

---

## 📄 Licencia

Este proyecto es open-source. Siéntete libre de colaborar, usar y mejorar el código.

---

## ❤️ Contribuir

¡Nos encanta recibir contribuciones! Abre un issue o haz un PR con tus mejoras o sugerencias.

---

> Proyecto desarrollado en el SENA – 2025. Inspirado en la magia nocturna de Popayán 🌙

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

### Usuarios Normales (rol 8)
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
