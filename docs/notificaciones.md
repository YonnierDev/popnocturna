# 📣 Notificaciones en Tiempo Real – PopNocturna

## 1. Resumen General
El sistema de notificaciones utiliza **Socket.IO** para enviar mensajes en tiempo real a los usuarios según su rol (propietario, admin, super admin). Actualmente, las notificaciones solo se muestran mientras el usuario está conectado y no se almacenan en la base de datos.

---

## 2. Flujo de Conexión y Autenticación
- El usuario se conecta al backend de Socket.IO enviando su **token JWT**.
- El backend decodifica el token y automáticamente une al usuario a la sala correspondiente:
  - **Admins/Super Admins:** `admin-room`
  - **Propietarios:** `usuario-<id>`
- El frontend solo necesita el token JWT para recibir notificaciones según el rol.

---

## 3. Eventos de Notificación Implementados

| Evento                    | Destinatario         | Mensaje Ejemplo                                     | Contexto                                 |
|---------------------------|----------------------|-----------------------------------------------------|------------------------------------------|
| `nuevo-lugar-admin`       | Admin/Super Admin    | "Nuevo lugar creado por <correo>"                   | Un propietario crea un lugar             |
| `nuevo-lugar-propietario` | Propietario          | "Tu lugar está en revisión"                         | El propietario crea un lugar             |
| `lugar-aprobado`          | Propietario          | "¡Tu lugar ha sido aprobado por un administrador!"  | Un admin aprueba el lugar                |
| `lugar-rechazado`         | Propietario          | "Tu lugar no fue aprobado y ya no está activo"      | Un admin rechaza el lugar                |

**Nota:** Puedes agregar más eventos siguiendo este patrón para actualizaciones, eliminaciones, etc.

---

## 4. Integración Frontend (Recomendación)
- El frontend debe escuchar los eventos de Socket.IO y mostrar las notificaciones en una campana, panel o modal.
- Ejemplo de manejo:
  - Mostrar el mensaje y detalles relevantes.
  - Acumular las notificaciones en memoria mientras la sesión esté activa.
- Si el usuario cierra sesión o recarga, las notificaciones se pierden (no hay historial).

---

## 5. ¿Qué pasa si quiero historial o push notifications?
- Será necesario crear una tabla de notificaciones en la base de datos y guardar cada notificación emitida.
- Se agregarán endpoints REST para consultar, marcar como leídas y eliminar notificaciones.
- Así podrás mostrar historial y enviar push notifications en la app móvil.

---

## 6. Guía para el Futuro
- Cuando se requiera persistencia, se recomienda:
  1. Crear la tabla `notificaciones` relacionada con usuarios.
  2. Guardar cada notificación relevante al emitirla.
  3. Implementar endpoints REST para historial y gestión.
  4. Integrar servicios de push (FCM/APNS) para la app móvil.

---

## 7. Ejemplo de conexión desde el frontend
```js
const socket = io('http://localhost:7000', {
  withCredentials: true,
  auth: { token: 'JWT_DEL_USUARIO' }
});

socket.on('nuevo-lugar-admin', (data) => { /* ... */ });
socket.on('nuevo-lugar-propietario', (data) => { /* ... */ });
socket.on('lugar-aprobado', (data) => { /* ... */ });
socket.on('lugar-rechazado', (data) => { /* ... */ });
```

---

## 8. Resumen
- **Notificaciones en tiempo real:** Solo mientras la sesión esté activa.
- **Sin historial:** Las notificaciones no se guardan en BD (por ahora).
- **Extensible:** Fácil de migrar a persistente y push cuando se requiera.


## Arquitectura

El sistema de notificaciones utiliza Socket.IO para implementar comunicaciones en tiempo real entre el servidor y los clientes. Las notificaciones se envían automáticamente cuando ocurren eventos importantes en el sistema.

## Tipos de Notificaciones

### 1. Notificaciones de Calificaciones

#### Eventos que generan notificaciones:
- **Nueva calificación**: Cuando un usuario califica un evento
- **Actualización de calificación**: Cuando un usuario actualiza su calificación
- **Eliminación de calificación**: Cuando una calificación es eliminada

#### Roles afectados:
- **Propietarios (rol 3)**: Reciben notificaciones cuando se califican eventos de sus lugares
- **Admins (roles 1,2)**: Reciben notificaciones de todas las calificaciones
- **Usuarios (rol 8)**: Reciben notificaciones cuando califican eventos

#### Ejemplo de estructura de notificación:
```json
{
  "tipo": "calificacion",
  "evento": {
    "id": 19,
    "nombre": "Concierto",
    "lugar": {
      "id": 123,
      "nombre": "disco Arena Rose"
    }
  },
  "calificacion": {
    "id": 27,
    "usuarioid": 48,
    "puntuacion": 5,
    "estado": true,
    "createdAt": "2025-05-04T01:41:22.000Z"
  }
}
```

### 2. Notificaciones de Eventos

#### Eventos que generan notificaciones:
- **Nuevo evento**: Cuando un propietario crea un nuevo evento
- **Evento actualizado**: Cuando un propietario actualiza un evento
- **Evento eliminado**: Cuando un propietario elimina un evento

#### Roles afectados:
- **Propietarios (rol 3)**: Reciben notificaciones de sus eventos
- **Admins (roles 1,2)**: Reciben notificaciones de todos los eventos
- **Usuarios (rol 8)**: Reciben notificaciones cuando interactúan con eventos

#### Ejemplo de estructura de notificación:
```json
{
  "tipo": "evento",
  "evento": {
    "id": 19,
    "nombre": "Concierto",
    "descripcion": "Gran fiesta",
    "fecha_hora": "2025-05-05T20:00:00Z",
    "lugar": {
      "id": 123,
      "nombre": "disco Arena Rose"
    }
  }
}
```

### 3. Notificaciones de Lugares

#### Eventos que generan notificaciones:
- **Nuevo lugar**: Cuando un propietario crea un nuevo lugar
- **Lugar aprobado**: Cuando un administrador aprueba un lugar (estado=true, aprobacion=true)
- **Lugar rechazado**: Cuando un administrador rechaza un lugar (estado=false, aprobacion=false)
- **Lugar actualizado**: Cuando un propietario actualiza un lugar
- **Lugar eliminado**: Cuando un propietario elimina un lugar

#### Roles afectados:
- **Propietarios (rol 3)**: Reciben notificaciones de sus lugares
- **Admins (roles 1,2)**: Reciben notificaciones de todos los lugares
- **Usuarios (rol 8)**: Reciben notificaciones cuando interactúan con lugares

#### Ejemplo de estructura de notificación:
```json
{
  "tipo": "lugar",
  "lugar": {
    "id": 123,
    "nombre": "disco Arena Rose",
    "direccion": "Calle 123",
    "estado": true,
    "aprobacion": true,
    "categoria": {
      "id": 1,
      "nombre": "Discoteca"
    }
  },
  "timestamp": "2025-05-04T19:44:06.362Z",
  "mensaje": "¡Tu lugar ha sido aprobado por un administrador!"
}
```

#### Ejemplo de notificación de rechazo:
```json
{
  "tipo": "lugar",
  "lugar": {
    "id": 123,
    "nombre": "disco Arena Rose",
    "direccion": "Calle 123",
    "estado": false,
    "aprobacion": false,
    "categoria": {
      "id": 1,
      "nombre": "Discoteca"
    }
  },
  "timestamp": "2025-05-04T19:50:06.362Z",
  "mensaje": "Tu lugar no fue aprobado y ya no está activo"
}
```

### 4. Notificaciones de Comentarios

#### Eventos que generan notificaciones:
- **Nuevo comentario**: Cuando un usuario comenta un evento
- **Reporte de comentario**: Cuando un comentario es reportado
- **Eliminación de comentario**: Cuando un comentario es eliminado

#### Roles afectados:
- **Propietarios (rol 3)**: Reciben notificaciones de comentarios en sus eventos
- **Admins (roles 1,2)**: Reciben notificaciones de reportes y comentarios
- **Usuarios (rol 8)**: Reciben notificaciones cuando comentan eventos

## Manejo Robusto de IDs de Usuario

Para garantizar que las notificaciones lleguen correctamente a los usuarios, se implementó un acceso flexible al ID del usuario que funciona con diferentes estructuras de datos:

```javascript
// En el controlador
const userId = result.lugar.usuarioid || (result.lugar.usuario && result.lugar.usuario.id);
if (userId) {
  io.to(`usuario-${userId}`).emit('lugar-aprobado', { /* datos */ });
}
```

Esta implementación:
- Intenta primero acceder a `usuarioid` directamente
- Si no está disponible, intenta acceder a través de la relación `usuario.id`
- Garantiza que las notificaciones funcionen independientemente de la estructura

## Implementación del Frontend

### 1. Configuración Inicial

```javascript
// 1. Importar Socket.IO
import { io } from 'socket.io-client';

// 2. Configurar la conexión
const socket = io('http://localhost:7000', {
    withCredentials: true,
    auth: {
        token: localStorage.getItem('token')
    }
});

// 3. Manejar la conexión
socket.on('connect', () => {
    console.log('Conectado al servidor de Socket.IO');
    
    // Obtener información del usuario
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    // Unirse a la sala personal del usuario
    socket.emit('join', { usuarioid: usuario.id });
    
    // Si es admin, unirse a la sala de administradores
    if (usuario.rol === '1' || usuario.rol === '2') {
        socket.emit('join-admin-room', { rol: usuario.rol });
    }
});

// 4. Manejar errores de conexión
socket.on('connect_error', (error) => {
    console.error('Error al conectar:', error);
    // Implementar lógica de reconexión
    setTimeout(() => {
        socket.connect();
    }, 5000);
});
```

### 2. Suscripción a Eventos de Calificaciones

```javascript
// 1. Suscribirse a nuevas calificaciones
socket.on('nueva_calificacion', (data) => {
    console.log('Nueva calificación recibida:', data);
    
    // Actualizar estado global
    actualizarEstadoCalificaciones(data);
    
    // Mostrar notificación
    mostrarNotificacion({
        tipo: 'calificacion',
        mensaje: `Nueva calificación para ${data.evento.nombre}`
    });
});

// 2. Suscribirse a actualizaciones de calificaciones
socket.on('calificacion_actualizada', (data) => {
    console.log('Calificación actualizada:', data);
    actualizarEstadoCalificaciones(data);
});

// 3. Suscribirse a eliminación de calificaciones
socket.on('calificacion_eliminada', (data) => {
    console.log('Calificación eliminada:', data);
    actualizarEstadoCalificaciones(data);
});
```

### 3. Manejo del Estado

```javascript
// Estado inicial
const estado = {
    calificaciones: [],
    notificaciones: []
};

// Actualizar estado cuando llega una nueva calificación
function actualizarEstadoCalificaciones(data) {
    switch(data.tipo) {
        case 'nueva':
            estado.calificaciones.push(data.calificacion);
            break;
            
        case 'actualizada':
            const index = estado.calificaciones.findIndex(c => c.id === data.calificacion.id);
            if (index !== -1) {
                estado.calificaciones[index] = data.calificacion;
            }
            break;
            
        case 'eliminada':
            estado.calificaciones = estado.calificaciones.filter(c => c.id !== data.calificacion.id);
            break;
    }
    
    // Actualizar interfaz
    actualizarInterfazCalificaciones();
}

// Actualizar interfaz
function actualizarInterfazCalificaciones() {
    // Implementar lógica para actualizar la interfaz
    // Ejemplo:
    const calificacionesContainer = document.getElementById('calificaciones');
    calificacionesContainer.innerHTML = renderCalificaciones(estado.calificaciones);
}
```

### 4. Manejo de Notificaciones

```javascript
// Estado de notificaciones
const notificaciones = [];

// Mostrar notificación
function mostrarNotificacion(data) {
    const notification = {
        id: Date.now(),
        tipo: data.tipo,
        mensaje: data.mensaje,
        leida: false,
        timestamp: new Date()
    };
    
    notificaciones.push(notification);
    actualizarInterfazNotificaciones();
}

// Actualizar interfaz de notificaciones
function actualizarInterfazNotificaciones() {
    const notificationsContainer = document.getElementById('notifications');
    notificationsContainer.innerHTML = renderNotifications(notificaciones);
}
```

### 5. Ejemplo Completo de Componente

```javascript
class CalificacionesComponent {
    constructor() {
        this.inicializarSocket();
        this.inicializarEstado();
        this.inicializarInterfaz();
    }

    inicializarSocket() {
        this.socket = io('http://localhost:7000', {
            withCredentials: true,
            auth: {
                token: localStorage.getItem('token')
            }
        });

        this.socket.on('connect', () => this.conectar());
        this.socket.on('connect_error', (error) => this.manejarError(error));
        
        // Suscribirse a eventos
        this.socket.on('nueva_calificacion', (data) => this.nuevaCalificacion(data));
        this.socket.on('calificacion_actualizada', (data) => this.actualizarCalificacion(data));
        this.socket.on('calificacion_eliminada', (data) => this.eliminarCalificacion(data));
    }

    conectar() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        this.socket.emit('join', { usuarioid: usuario.id });
        if (usuario.rol === '1' || usuario.rol === '2') {
            this.socket.emit('join-admin-room', { rol: usuario.rol });
        }
    }

    manejarError(error) {
        console.error('Error de conexión:', error);
        setTimeout(() => this.socket.connect(), 5000);
    }

    nuevaCalificacion(data) {
        this.actualizarEstadoCalificaciones(data);
        this.mostrarNotificacion({
            tipo: 'calificacion',
            mensaje: `Nueva calificación para ${data.evento.nombre}`
        });
    }

    actualizarCalificacion(data) {
        this.actualizarEstadoCalificaciones(data);
    }

    eliminarCalificacion(data) {
        this.actualizarEstadoCalificaciones(data);
    }

    actualizarEstadoCalificaciones(data) {
        // Implementar lógica de actualización del estado
    }

    actualizarInterfaz() {
        // Implementar lógica de actualización de la interfaz
    }
}

// Usar el componente
const calificaciones = new CalificacionesComponent();
```

## Manejo de Errores

### Errores Comunes
1. **Desconexión del servidor**:
   - Mensaje: "Error de conexión con el servidor"
   - Solución: Reconectar automáticamente

2. **Token expirado**:
   - Mensaje: "Sesión expirada"
   - Solución: Redirigir a login

3. **Permisos insuficientes**:
   - Mensaje: "Acceso denegado"
   - Solución: Mostrar mensaje de error

## Mejores Prácticas

1. **Optimización de conexiones**:
   - Mantener una sola conexión por cliente
   - Implementar reconexión automática
   - Manejar estados offline correctamente
   - Limpiar conexiones al destruir componentes

2. **Seguridad**:
   - Validar tokens en cada mensaje
   - Implementar rate limiting
   - Proteger endpoints sensibles
   - Usar HTTPS en producción

3. **Performance**:
   - Implementar paginación en consultas
   - Minimizar datos transferidos
   - Usar compresión de datos cuando sea necesario
   - Implementar debounce en actualizaciones de interfaz

4. **Manejo de Estado**:
   - Usar Redux o estado global para manejar datos compartidos
   - Implementar caché para datos frecuentemente accedidos
   - Limpiar estado al desconectar

5. **Monitoreo**:
   - Implementar logging de eventos
   - Monitorear rendimiento de conexiones
   - Alertas para desconexiones frecuentes

## Ejemplo de Implementación Completa

```javascript
// 1. Configuración inicial
import { io } from 'socket.io-client';
import { store } from './store';
import { setCalificaciones, addNotification } from './store/slices/calificacionesSlice';

const socket = io('http://localhost:7000', {
    withCredentials: true,
    auth: {
        token: localStorage.getItem('token')
    }
});

// 2. Manejo de conexión
socket.on('connect', () => {
    console.log('Conectado al servidor');
    
    // Unirse a salas según el rol
    const usuario = store.getState().auth.usuario;
    socket.emit('join', { usuarioid: usuario.id });
    
    if (usuario.rol === '1' || usuario.rol === '2') {
        socket.emit('join-admin-room', { rol: usuario.rol });
    }
});

// 3. Manejo de errores
socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error);
    // Implementar lógica de reconexión
    setTimeout(() => {
        socket.connect();
    }, 5000);
});

// 4. Suscripción a eventos
socket.on('nueva_calificacion', (data) => {
    console.log('Nueva calificación recibida:', data);
    
    // Actualizar estado global
    store.dispatch(setCalificaciones(data));
    
    // Mostrar notificación
    store.dispatch(addNotification({
        tipo: 'calificacion',
        mensaje: `Nueva calificación para ${data.evento.nombre}`
    }));
});

// 5. Manejo de desconexión
socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
    // Limpiar estado
    store.dispatch(setCalificaciones([]));
});

// 6. Componente de Calificaciones
export const CalificacionesComponent = () => {
    const calificaciones = useSelector(state => state.calificaciones.calificaciones);
    const dispatch = useDispatch();

    useEffect(() => {
        // Suscribirse a eventos
        socket.on('nueva_calificacion', (data) => {
            dispatch(setCalificaciones(data));
        });

        // Limpiar suscripciones al desmontar
        return () => {
            socket.off('nueva_calificacion');
        };
    }, [dispatch]);

    return (
        <div className="calificaciones-container">
            {calificaciones.map(calificacion => (
                <CalificacionItem
                    key={calificacion.id}
                    calificacion={calificacion}
                />
            ))}
        </div>
    );
};

// 7. Componente de Notificaciones
export const NotificacionesComponent = () => {
    const notificaciones = useSelector(state => state.calificaciones.notificaciones);

    return (
        <div className="notifications-container">
            {notificaciones.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                />
            ))}
        </div>
    );
};

// 8. Store configuration
const store = configureStore({
    reducer: {
        calificaciones: calificacionesReducer,
        auth: authReducer
    }
});

// 9. Slice de Calificaciones
const calificacionesSlice = createSlice({
    name: 'calificaciones',
    initialState: {
        calificaciones: [],
        notificaciones: [],
        loading: false
    },
    reducers: {
        setCalificaciones: (state, action) => {
            state.calificaciones = action.payload;
        },
        addNotification: (state, action) => {
            state.notificaciones.push(action.payload);
        }
    }
});

// 10. Reducer de Calificaciones
export const calificacionesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_CALIFICACIONES':
            return {
                ...state,
                calificaciones: action.payload
            };
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notificaciones: [...state.notificaciones, action.payload]
            };
        default:
            return state;
    }
};

// 11. Selector de Calificaciones
export const selectCalificaciones = (state) => state.calificaciones.calificaciones;

// 12. Selector de Notificaciones
export const selectNotifications = (state) => state.calificaciones.notificaciones;

## Ejemplo Completo de Implementación

```javascript
// Inicialización de Socket.IO
const socket = io('http://localhost:7000', {
    auth: {
        token: obtenerTokenDeSesion()
    }
});

// Manejadores de eventos
socket.on('connect', () => {
    console.log('Conectado al servidor');
    // Suscribirse a eventos específicos del rol
    const rol = obtenerRolUsuario();
    if (rol === 3) { // Propietario
        socket.emit('suscribir_propietario', { lugarid: obtenerLugarId() });
    }
});

// Manejar notificaciones
socket.on('nueva_calificacion', (data) => {
    actualizarEstado(data);
    mostrarNotificacion('Nueva calificación recibida');
});

// Manejar errores
socket.on('error', (error) => {
    manejarError(error);
});

// Función para reconectar
function reconectar() {
    socket.close();
    setTimeout(() => {
        socket.connect();
    }, 5000);
}
```

## Consideraciones Finales

1. **Escalabilidad**:
   - Implementar clustering para manejar múltiples instancias
   - Usar Redis para sincronizar estados entre instancias
   - Implementar balanceo de carga

2. **Monitoreo**:
   - Implementar logging de eventos
   - Monitorear rendimiento de conexiones
   - Alertas para desconexiones frecuentes

3. **Mantenimiento**:
   - Documentar todos los eventos
   - Mantener consistencia en el formato de mensajes
   - Implementar versionado de API de eventos
