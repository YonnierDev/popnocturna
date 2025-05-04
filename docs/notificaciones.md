# Sistema de Notificaciones - PopNocturna

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

### 2. Notificaciones de Comentarios

#### Eventos que generan notificaciones:
- **Nuevo comentario**: Cuando un usuario comenta un evento
- **Reporte de comentario**: Cuando un comentario es reportado
- **Eliminación de comentario**: Cuando un comentario es eliminado

#### Roles afectados:
- **Propietarios (rol 3)**: Reciben notificaciones de comentarios en sus eventos
- **Admins (roles 1,2)**: Reciben notificaciones de reportes y comentarios
- **Usuarios (rol 8)**: Reciben notificaciones cuando comentan eventos

## Implementación del Frontend

### 1. Conexión a Socket.IO
```javascript
// Conectar al servidor de Socket.IO
const socket = io('http://localhost:7000');

// Manejar la conexión
socket.on('connect', () => {
    console.log('Conectado al servidor de Socket.IO');
});

// Manejar errores
socket.on('connect_error', (error) => {
    console.error('Error al conectar:', error);
});
```

### 2. Suscripción a Eventos
```javascript
// Suscribirse a notificaciones de calificaciones
socket.on('nueva_calificacion', (data) => {
    actualizarInterfazCalificaciones(data);
});

// Suscribirse a notificaciones de comentarios
socket.on('nuevo_comentario', (data) => {
    actualizarInterfazComentarios(data);
});
```

### 3. Manejo de Estado
```javascript
// Estado inicial
const estado = {
    calificaciones: [],
    comentarios: [],
    notificaciones: []
};

// Actualizar estado cuando llega una nueva notificación
function actualizarEstado(data) {
    switch(data.tipo) {
        case 'calificacion':
            estado.calificaciones.push(data.calificacion);
            break;
        case 'comentario':
            estado.comentarios.push(data.comentario);
            break;
    }
    actualizarInterfaz();
}
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

2. **Seguridad**:
   - Validar tokens en cada mensaje
   - Implementar rate limiting
   - Proteger endpoints sensibles

3. **Performance**:
   - Implementar paginación en consultas
   - Minimizar datos transferidos
   - Usar compresión de datos cuando sea necesario

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
