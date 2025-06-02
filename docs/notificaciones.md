# Notificaciones en Tiempo Real – PopNocturna

## 🔌 Configuración Inicial

### Conexión WebSocket
```javascript
import { io } from 'socket.io-client';

// En desarrollo
const socket = io('http://localhost:7000', {
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
  },
});

// En producción
const socket = io('https://popnocturna.vercel.app', {
  withCredentials: true,
  transports: ['websocket'],
});

// Manejar eventos de conexión
export const setupSocket = (token) => {
  // Configurar cabecera de autenticación
  socket.auth = { token };
  
  socket.on('connect', () => {
    console.log('Conectado al servidor de notificaciones');
  });

  socket.on('disconnect', () => {
    console.log('Desconectado del servidor de notificaciones');
  });

  return socket;
};
```

### Configuración CORS
El backend está configurado para aceptar conexiones de:
- `https://frontendpopa.vercel.app` (producción)
- `http://localhost:5173` (desarrollo)

Métodos HTTP permitidos: GET, POST, PUT, DELETE, PATCH, OPTIONS

---

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

## 2. Eventos Disponibles para Propietarios (Rol 3)

### 2.1 Aprobación de Lugar
```javascript
socket.on('lugar-aprobado', (data) => {
  // data = {
  //   lugar: {
  //     id: number,
  //     nombre: string
  //   },
  //   timestamp: string,
  //   mensaje: "¡Tu lugar ha sido aprobado!"
  // }
});
```

### 2.2 Rechazo de Lugar
```javascript
socket.on('lugar-rechazado', (data) => {
  // data = {
  //   lugar: {
  //     id: number,
  //     nombre: string
  //   },
  //   timestamp: string,
  //   mensaje: "Tu lugar no fue aprobado"
  // }
});
```

## 3. Eventos Disponibles para Administradores (Roles 1 y 2)

### 3.1 Nuevos Lugares Pendientes
```javascript
socket.on('nuevo-lugar-admin', (data) => {
  // data = {
  //   lugar: {
  //     id: number,
  //     nombre: string
  //   },
  //   timestamp: string,
  //   mensaje: "Nuevo lugar pendiente de aprobación"
  // }
});
```

## 4. Implementación en el Frontend

### 4.1 Conexión Básica
```javascript
import { io } from 'socket.io-client';

const socket = io('https://popnocturna.vercel.app', {
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

### 4.2 Unirse a las Salas

#### Para Propietarios
```javascript
socket.emit('join', { usuarioid: id });
```

#### Para Usuarios
```javascript
socket.emit('join-usuario-room', { rol: 4 });
```

#### Para Administradores
```javascript
socket.emit('join-admin-room', { rol: 1 }); // o rol: 2
```

### 4.3 Manejo de Notificaciones
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

// Para propietarios
socket.on('lugar-aprobado', (data) => {
  mostrarNotificacion({
    titulo: 'Lugar Aprobado',
    mensaje: data.mensaje,
    tipo: 'aprobacion'
  });
});

socket.on('lugar-rechazado', (data) => {
  mostrarNotificacion({
    titulo: 'Lugar Rechazado',
    mensaje: data.mensaje,
    tipo: 'rechazo'
  });
});

// Para administradores
socket.on('nuevo-lugar-admin', (data) => {
  mostrarNotificacion({
    titulo: 'Nuevo Lugar Pendiente',
    mensaje: data.mensaje,
    tipo: 'pendiente'
  });
});
```

## 5. Consideraciones Importantes

1. **Autenticación**: Siempre incluir el token JWT en la conexión
2. **Reconexión**: El cliente se reconectará automáticamente si pierde la conexión
3. **Notificaciones Específicas**: 
   - Los comentarios solo se reciben si has comentado en el mismo evento
   - Las calificaciones solo se reciben si has calificado el mismo evento
   - Las notificaciones de propietarios son personalizadas por usuario

## 6. Detalles Técnicos del Backend

### 6.1 Configuración
```javascript
const io = new Server(server, {
  cors: {
    origin: ["https://frontendpopa.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});
```

### 6.2 Salas (Rooms) - WebSocket

#### Conexión Inicial
```javascript
// Unirse a la sala del usuario
socket.emit('join', { usuarioid: userId });

// Para usuarios normales (rol 4)
socket.emit('join-usuario-room', { rol: 4 });

// Para propietarios (rol 3)
socket.emit('join-propietario-room', { rol: 3 });

// Para administradores (roles 1 y 2)
socket.emit('join-admin-room', { rol: 1 });
```

#### Salas Disponibles
- `admin-room`: Para administradores (roles 1 y 2)
- `propietario-${userId}`: Para propietarios (rol 3)
- `usuario-${userId}`: Para usuarios normales (rol 4)
- `usuario-room`: Para notificaciones generales de usuarios (rol 4)

#### Manejo de Reconexión
```javascript
// Configurar reintentos de conexión
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const connectWithRetry = () => {
  socket.connect();
  
  socket.on('connect_error', (error) => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      console.log(`Error de conexión. Reintentando en ${delay}ms...`);
      setTimeout(connectWithRetry, delay);
    } else {
      console.error('Número máximo de intentos de reconexión alcanzado');
    }
  });
};

// Iniciar conexión con reintentos
connectWithRetry();
```
- `admin-room`: Para administradores (roles 1 y 2)
- `usuario-${userId}`: Para propietarios (rol 3)
- `usuario-room`: Para usuarios normales (rol 4)

### 6.3 Seguridad
1. Todas las conexiones deben ser autenticadas
2. Los eventos son específicos por rol
3. Las notificaciones se envían solo a las salas correspondientes
4. Se implementa rate limiting para prevenir abusos
5. Las notificaciones de comentarios y calificaciones son específicas para usuarios que han interactuado con el mismo evento
6. Las notificaciones de propietarios son personalizadas por usuario para mantener la privacidad
