# 📣 Notificaciones en Tiempo Real – PopNocturna

## 1. Eventos Disponibles para Usuarios (Rol 4)

### 1.1 Nuevos Lugares
```javascript
socket.on('nuevo-lugar-usuario', (data) => {
  // data = {
  //   lugar: {
  //     id: number,
  //     nombre: string
  //   },
  //   timestamp: string,
  //   mensaje: "Nuevo lugar disponible: [nombre]"
  // }
});
```

### 1.2 Nuevos Eventos
```javascript
socket.on('nuevo-evento-usuario', (data) => {
  // data = {
  //   evento: {
  //     id: number,
  //     nombre: string
  //   },
  //   timestamp: string,
  //   mensaje: "Nuevo evento disponible: [nombre]"
  // }
});
```

### 1.3 Nuevos Comentarios
```javascript
socket.on('nuevo-comentario-usuario', (data) => {
  // data = {
  //   evento: {
  //     id: number,
  //     nombre: string
  //   },
  //   comentario: {
  //     contenido: string,
  //     usuarioid: number
  //   },
  //   timestamp: string
  // }
});
```

### 1.4 Nuevas Calificaciones
```javascript
socket.on('nueva-calificacion-usuario', (data) => {
  // data = {
  //   evento: {
  //     id: number,
  //     nombre: string
  //   },
  //   calificacion: {
  //     puntuacion: number,
  //     usuarioid: number
  //   },
  //   timestamp: string
  // }
});
```

## 2. Implementación en el Frontend

### 2.1 Conexión Básica
```javascript
import { io } from 'socket.io-client';

const socket = io('URL_DEL_BACKEND', {
  auth: {
    token: 'TU_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Conectado al servidor de notificaciones');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});
```

### 2.2 Manejo de Notificaciones
```javascript
// Ejemplo de manejo de notificaciones
socket.on('nuevo-lugar-usuario', (data) => {
  // Mostrar notificación al usuario
  mostrarNotificacion({
    titulo: 'Nuevo Lugar',
    mensaje: data.mensaje,
    tipo: 'lugar'
  });
});

socket.on('nuevo-evento-usuario', (data) => {
  mostrarNotificacion({
    titulo: 'Nuevo Evento',
    mensaje: data.mensaje,
    tipo: 'evento'
  });
});

socket.on('nuevo-comentario-usuario', (data) => {
  mostrarNotificacion({
    titulo: 'Nuevo Comentario',
    mensaje: `Nuevo comentario en ${data.evento.nombre}`,
    tipo: 'comentario'
  });
});

socket.on('nueva-calificacion-usuario', (data) => {
  mostrarNotificacion({
    titulo: 'Nueva Calificación',
    mensaje: `Nueva calificación en ${data.evento.nombre}`,
    tipo: 'calificacion'
  });
});
```

## 3. Consideraciones Importantes

1. **Autenticación**: Siempre incluir el token JWT en la conexión
2. **Reconexión**: El cliente se reconectará automáticamente si pierde la conexión
3. **Notificaciones Específicas**: 
   - Los comentarios solo se reciben si has comentado en el mismo evento
   - Las calificaciones solo se reciben si has calificado el mismo evento

## 4. Detalles Técnicos del Backend (Para Referencia)

### 4.1 Configuración
```javascript
const io = new Server(server, {
  cors: {
    origin: ["https://frontendpopa.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});
```

### 4.2 Salas (Rooms)
- `admin-room`: Para administradores (roles 1 y 2)
- `usuario-${userId}`: Para propietarios (rol 3)
- `usuario-room`: Para usuarios normales (rol 4)

### 4.3 Seguridad
1. Todas las conexiones deben ser autenticadas
2. Los eventos son específicos por rol
3. Las notificaciones se envían solo a las salas correspondientes
4. Se implementa rate limiting para prevenir abusos
5. Las notificaciones de comentarios y calificaciones son específicas para usuarios que han interactuado con el mismo evento
