require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require("./models");
const { sequelize } = require('./models');

console.log("🔧 Iniciando servidor...");
console.log("🔧 Configuración de entorno:");
console.log("🌍 Entorno:", process.env.NODE_ENV);
console.log("🔒 SSL:", "Habilitado");

const app = express();
const server = http.createServer(app);

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración CORS mejorada
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://popnocturna.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El origen de la petición no está permitido por CORS';
      console.warn(`Origen no permitido: ${origin}`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,  // Permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,  // Tiempo que el navegador puede cachear la respuesta CORS (en segundos)
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware CORS
app.use(cors(corsOptions));

// Servir archivos estáticos desde la carpeta public
app.use('/static', express.static(path.join(__dirname, 'public')));

// Ruta específica para socket.html
app.get('/socket', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'socket.html'));
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "API funcionando correctamente",
    environment: process.env.NODE_ENV,
    database: "Conectado a Railway"
  });
});

// Rutas públicas (sin token requerido)
app.use("/api", require("./routes/usuarioRoutes"));
app.use("/api", require("./routes/autentiRouter"));

// Rutas protegidas (requieren token)
app.use("/api", require("./routes/rolRouter"));
app.use("/api", require("./routes/usuariosRouter/categoriasParaUsuarioRouter"));
app.use("/api", require("./routes/categoriaRoutes"));
app.use("/api", require("./routes/lugarRoutes"));
app.use("/api", require("./routes/eventoRoutes"));
app.use("/api", require("./routes/reservaRouter"));
app.use("/api", require("./routes/calificacionRoutes"));
app.use("/api", require("./routes/comentarioRoutes"));
app.use("/api", require("./routes/solicitudOcultarComentarioRoutes"));
app.use("/api", require("./routes/propietarioRouters/propietarioLugarRouter"));
app.use("/api", require("./routes/propietarioRouters/propietarioEventoReservaRouter"));
app.use("/api", require("./routes/propietarioRouters/propietarioReservaEventoLugarRouter"));
app.use("/api", require("./routes/propietarioRouters/categoriaUsuarioRolRouter"));
app.use("/api", require("./routes/reporteRoutes"));
app.use('/api', require("./routes/notificacionRouter"));
app.use('/api', require("./routes/solicitudRouter"));

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

// Hacer que io esté disponible globalmente
app.set('io', io);

// Manejo de conexiones Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Manejar unirse a sala de usuario
  socket.on("join", ({ usuarioid }) => {
    console.log(`Usuario ${usuarioid} uniéndose a sala usuario-${usuarioid}`);
    socket.join(`usuario-${usuarioid}`);
  });

  // Manejar unirse a sala de usuarios (rol 4)
  socket.on("join-usuario-room", ({ rol }) => {
    if (rol === 4) {
      console.log(`Usuario con rol ${rol} uniéndose a sala usuario-room`);
      socket.join('usuario-room');
    }
  });

  // Manejar unirse a sala de administradores
  socket.on("join-admin-room", ({ rol }) => {
    if (rol === 1 || rol === 2) {
      console.log(`Usuario con rol ${rol} uniéndose a sala admin-room`);
      socket.join('admin-room');
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Error en el servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {}
  });
});

// Puerto
const PORT = process.env.PORT || 7000;

// Iniciar servidor
server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('🔧 Iniciando servidor...');
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
});

module.exports = app;
