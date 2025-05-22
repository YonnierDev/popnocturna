require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
app.use(express.json());

// Configuración de CORS más específica
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://popnocturna.vercel.app',
  'https://frontendpopa.vercel.app'
];

app.use(
  cors({
    origin: function(origin, callback) {
      // Permitir solicitudes sin origen (como las de Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Origen bloqueado por CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use("/api", require("./routes/perfilRouter"));
app.use("/api", require("./routes/rolRouter"));
app.use("/api", require("./routes/usuarioRoutes"));
app.use("/api", require("./routes/categoriaRoutes"));
app.use("/api", require("./routes/propietarioRouters/propietarioLugarRouter"));
app.use("/api", require("./routes/lugarRoutes"));
app.use("/api", require("./routes/eventoRoutes"));
app.use("/api", require("./routes/calificacionRoutes"));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: allowedOrigins,
    methods: ['GET','POST','PATCH', 'OPTIONS','DELETE'],
    credentials: true
  } 
});
app.set('io', io);

// Servir archivos estáticos (para socket-test.html)
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO: manejar nuevas conexiones
const jwt = require('jsonwebtoken');
io.on('connection', socket => {
  console.log('Nuevo cliente conectado:', socket.id);
  
  // Emitir un mensaje de prueba
  socket.emit('notificacion', { mensaje: '¡Bienvenido a Popayán Nocturna!' });

  // Intentar obtener token JWT de handshake
  const token = socket.handshake.auth && socket.handshake.auth.token;
  let payload = null;
  if (token) {
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'miclavesegura');
      if (payload.rol == 1 || payload.rol == 2) {
        socket.join('admin-room');
        console.log(`Socket ${socket.id} (admin/superadmin) entró en sala admin-room`);
      }
      if (payload.rol == 3) {
        socket.join(`usuario-${payload.id}`);
        console.log(`Socket ${socket.id} (propietario) entró en sala usuario-${payload.id}`);
      }
    } catch (err) {
      console.log('Error al verificar token JWT en conexión Socket.IO:', err.message);
    }
  } else {
    console.log('No se recibió token JWT en conexión Socket.IO');
  }

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

app.use("/api", require("./routes/reservaRouter"));
app.use("/api", require("./routes/comentarioRoutes"));
app.use("/api", require("./routes/reporteRoutes"));
app.use("/api", require("./routes/autentiRouter"));
app.use("/api", require("./routes/propietarioRoutes"));
app.use("/api", require("./routes/propietarioRouters/categoriaUsuarioRolRouter"));
app.use("/api", require("./routes/propietarioRouters/reservaUsuarioEventoLugarRouter"));
app.use("/api", require("./routes/propietarioRouters/propietarioEventoReservaRouter"));
app.use("/api", require("./routes/propietarioRouters/propietarioReservaEventoLugarRouter"));
app.use("/api", require("./routes/usuariosRouter/categoriasParaUsuarioRouter"));
app.use("/api", require("./routes/solicitudOcultarComentarioRoutes"));
app.use("/api", require("./routes/propietarioRouters/propietarioLugarRouter"));

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

module.exports = app;
