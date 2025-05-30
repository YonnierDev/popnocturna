# 📣 Notificaciones en Tiempo Real – PopNocturna

## 1. Resumen General
El sistema de notificaciones utiliza **Socket.IO** para enviar mensajes en tiempo real a los usuarios según su rol (propietario, admin, super admin). Las notificaciones se envían automáticamente cuando ocurren eventos importantes en el sistema.

## 2. Configuración del Backend
```javascript
const io = new Server(server, {
  cors: {
    origin: ["https://frontendpopa.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});
```

## 3. Eventos Disponibles

### 3.1 Notificaciones de Lugares
| Evento | Destinatario | Descripción |
|--------|--------------|-------------|
| `nuevo-lugar-admin` | Admin/Super Admin | Se emite cuando un propietario crea un nuevo lugar |
| `nuevo-lugar-propietario` | Propietario | Se emite al propietario cuando crea un lugar |
| `lugar-aprobado` | Propietario | Se emite cuando un admin aprueba un lugar |
| `lugar-rechazado` | Propietario | Se emite cuando un admin rechaza un lugar |
| `lugar-actualizado` | Propietario/Admin | Se emite cuando se actualiza un lugar |

### 3.2 Notificaciones de Eventos
| Evento | Destinatario | Descripción |
|--------|--------------|-------------|
| `nuevo-evento-admin` | Admin/Super Admin | Se emite cuando se crea un nuevo evento |
| `nuevo-evento-usuario` | Usuario | Se emite cuando se crea un evento en un lugar favorito |

### 3.3 Notificaciones de Calificaciones
| Evento | Destinatario | Descripción |
|--------|--------------|-------------|
| `nueva-calificacion` | Propietario/Admin | Se emite cuando se crea una nueva calificación |

### 3.4 Notificaciones de Reportes
| Evento | Destinatario | Descripción |
|--------|--------------|-------------|
| `notificaciones-reportes` | Admin/Super Admin | Se emite cuando hay nuevos reportes |

## 4. Estructura de los Eventos

### 4.1 Evento de Lugar
```json
{
  "tipo": "lugar",
  "lugar": {
    "id": 123,
    "nombre": "Nombre del Lugar",
    "direccion": "Dirección",
    "estado": true,
    "aprobacion": true,
    "categoria": {
      "id": 1,
      "nombre": "Categoría"
    }
  },
  "timestamp": "2024-03-21T12:00:00.000Z",
  "mensaje": "Mensaje de notificación"
}
```

### 4.2 Evento de Calificación
```json
{
  "tipo": "calificacion",
  "evento": {
    "id": 19,
    "nombre": "Nombre del Evento",
    "lugar": {
      "id": 123,
      "nombre": "Nombre del Lugar"
    }
  },
  "calificacion": {
    "id": 27,
    "usuarioid": 48,
    "puntuacion": 5,
    "estado": true,
    "createdAt": "2024-03-21T12:00:00.000Z"
  }
}
```

## 5. Salas (Rooms)

El sistema utiliza las siguientes salas para organizar las notificaciones:

- `admin-room`: Para administradores (roles 1 y 2)
- `usuario-${userId}`: Para propietarios (rol 3)
- `usuario-room`: Para usuarios normales (rol 4)

## 6. Autenticación

Las conexiones Socket.IO requieren autenticación mediante token JWT. El token debe enviarse en el objeto de autenticación al establecer la conexión.

## 7. Consideraciones de Seguridad

1. Todas las conexiones deben ser autenticadas
2. Los eventos son específicos por rol
3. Las notificaciones se envían solo a las salas correspondientes
4. Se implementa rate limiting para prevenir abusos

## 8. Monitoreo y Mantenimiento

1. Se recomienda monitorear:
   - Número de conexiones activas
   - Eventos emitidos por tipo
   - Errores de conexión
   - Tiempo de respuesta

2. Mantenimiento:
   - Documentar nuevos eventos
   - Mantener consistencia en el formato de mensajes
   - Implementar versionado de API de eventos
