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
npm run dev         # Desarrollo con nodemon
npm run start       # Producción
npm run test        # Pruebas unitarias
```

---

## ✅ Pruebas y QA

- Pruebas unitarias con `Jest` y `Supertest`
- Mock de datos y servicios
- Cobertura mínima del 80% usando `nyc`
- Linter automático con `ESLint` + `Prettier`
- Integración con GitHub Actions para CI

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
- Configuración automática de variables de entorno en Vercel

---

## 👥 Colaboradores

- **Yonnier (Backend & Scrum Master)**
- Marlon (Frontend)
- Camilo (Frontend)
- Jhoan (Admin Dashboard)
- Cristian (QA & Admin Dashboard)

---

## 📄 Licencia

Este proyecto es open-source. Siéntete libre de colaborar, usar y mejorar el código.

---

## ❤️ Contribuir

¡Nos encanta recibir contribuciones! Abre un issue o haz un PR con tus mejoras o sugerencias.

---

> Proyecto desarrollado en el SENA – 2025. Inspirado en la magia nocturna de Popayán 🌙

# API de Comentarios

## Estructura de Estados

### Estado de Visibilidad
- `estado: boolean`
  - `true`: Comentario visible
  - `false`: Comentario oculto

### Estado de Aprobación
- `aprobacion: ENUM`
  - `'pendiente'`: Comentario reportado, esperando revisión
  - `'aceptado'`: Comentario reportado y aprobado
  - `'rechazado'`: Comentario reportado y rechazado

## Endpoints Disponibles

### 1. Listar Comentarios por Evento
- **Ruta**: `GET /api/comentarios/evento/:eventoid`
- **Roles**: Todos los roles autenticados
- **Descripción**: Obtiene los comentarios de un evento específico
- **Respuesta**:
```json
[
  {
    "id": number,
    "contenido": string,
    "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
    "usuario": {
      "id": number,
      "nombre": string
    }
  }
]
```

### 2. Listar Todos los Comentarios
- **Ruta**: `GET /api/comentarios`
- **Roles**: 
  - 1,2 (SuperAdmin, Admin): ven todos los comentarios
  - 3 (Propietario): ven comentarios de sus lugares
  - 8 (Usuario): ven sus propios comentarios
- **Descripción**: Lista comentarios según el rol del usuario

### 3. Crear Comentario
- **Ruta**: `POST /api/comentario`
- **Roles**: 8 (Usuario)
- **Body**: 
```json
{
  "eventoid": number,
  "contenido": string
}
```
- **Respuesta**:
```json
{
  "id": number,
  "contenido": string,
  "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "estado": true,
  "aprobacion": null
}
```

### 4. Actualizar Comentario
- **Ruta**: `PUT /api/comentario/:id`
- **Roles**: 
  - 1,2 (SuperAdmin, Admin): pueden actualizar cualquier comentario
  - 8 (Usuario): solo pueden actualizar sus propios comentarios
- **Body**: 
```json
{
  "contenido": string
}
```
- **Respuesta**:
```json
{
  "mensaje": "Comentario actualizado exitosamente",
  "comentario": {
    "id": number,
    "contenido": string,
    "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ"
  }
}
```

### 5. Eliminar Comentario
- **Ruta**: `DELETE /api/comentario/:id`
- **Roles**:
  - 1,2 (SuperAdmin, Admin): pueden eliminar cualquier comentario
  - 8 (Usuario): solo pueden eliminar sus propios comentarios
- **Respuesta**:
```json
{
  "mensaje": "Comentario eliminado exitosamente",
  "comentario": {
    "id": number,
    "contenido": string,
    "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ"
  }
}
```

### 6. Reportar Comentario
- **Ruta**: `POST /api/comentario/:id/reportar`
- **Roles**: 3 (Propietario)
- **Body**: 
```json
{
  "motivo": string
}
```
- **Respuesta**:
```json
{
  "mensaje": "Comentario reportado exitosamente",
  "comentario": {
    "id": number,
    "estado": "pendiente",
    "contenido": string,
    "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
    "motivo_reporte": string
  }
}
```

### 7. Ver Comentarios Reportados
- **Ruta**: `GET /api/comentario/reportados`
- **Roles**: 1,2 (SuperAdmin, Admin)
- **Respuesta**:
```json
{
  "mensaje": "Comentarios reportados pendientes de revisión",
  "total": number,
  "comentarios": [
    {
      "id": number,
      "contenido": string,
      "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
      "motivo_reporte": string,
      "usuario": {
        "id": number,
        "nombre": string,
        "correo": string
      },
      "evento": {
        "id": number,
        "nombre": string,
        "descripcion": string,
        "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
        "lugar": {
          "id": number,
          "nombre": string,
          "propietario": {
            "id": number,
            "nombre": string,
            "correo": string
          }
        }
      }
    }
  ]
}
```

### 8. Actualizar Estado de Comentario Reportado
- **Ruta**: `PUT /api/comentario/:id/estado`
- **Roles**: 1,2 (SuperAdmin, Admin)
- **Body**: 
```json
{
  "estado": "aceptado" | "rechazado"
}
```
- **Respuesta**:
```json
{
  "mensaje": "Estado del comentario actualizado exitosamente",
  "comentario": {
    "id": number,
    "estado": string,
    "contenido": string,
    "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
    "motivo_reporte": string
  }
}
```

## Códigos de Error Comunes

- `400`: Solicitud incorrecta
- `403`: No autorizado
- `404`: Recurso no encontrado
- `500`: Error del servidor

## Notas de Implementación

1. Los comentarios nuevos se crean con:
   - `estado: true`
   - `aprobacion: null`

2. Al reportar un comentario:
   - Se mantiene `estado: true`
   - Se establece `aprobacion: 'pendiente'`
   - Se guarda el `motivo_reporte`

3. Al aprobar/rechazar:
   - Se mantiene `estado: true`
   - Se cambia `aprobacion` a `'aceptado'` o `'rechazado'`

4. Al eliminar:
   - Se establece `estado: false`

## Estado de Producción

✅ Todos los endpoints están implementados y probados  
✅ La documentación está completa y actualizada  
✅ Los roles y permisos están correctamente configurados  
✅ El manejo de estados de comentarios está funcionando  
✅ Las respuestas JSON están estandarizadas  
✅ Los errores están manejados apropiadamente
