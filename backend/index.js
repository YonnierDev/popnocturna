require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require("./models");
const { sequelize } = require('./models');
const usuarioRoutes = require('./routes/usuarioRoutes');
const perfilRouter = require('./routes/perfilRouter');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS para Express
app.use(cors({
  origin: ["https://frontendpopa.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", 
    "PATCH", "OPTIONS"],
  credentials: true
}));

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

// Rutas
// Rutas de autenticación y usuarios
app.use("/api", require("./routes/autentiRouter"));
app.use("/api", usuarioRoutes);
app.use("/api", perfilRouter);
app.use("/api", require("./routes/rolRouter"));
app.use("/api", require("./routes/usuariosRouter/categoriasParaUsuarioRouter"));

// Rutas de catálogo
app.use("/api", require("./routes/categoriaRoutes"));
app.use("/api", require("./routes/lugarRoutes"));
app.use("/api", require("./routes/eventoRoutes"));

// Rutas de reservas
app.use("/api", require("./routes/reservaRouter"));
app.use("/api", require("./routes/calificacionRoutes"));
app.use("/api", require("./routes/comentarioRoutes"));
app.use("/api", require("./routes/solicitudOcultarComentarioRoutes"));

// Rutas de propietario
app.use("/api", require("./routes/propietarioRouters/propietarioLugarRouter"));

// Rutas de reservas de propietario
const reservaUsuarioEventoRouter = require("./routes/propietarioRouters/reservaUsuarioEventoLugarRouter");
app.use("/api/propietario", reservaUsuarioEventoRouter);
console.log('Rutas de reservas de propietario montadas en /api/propietario');

app.use("/api", require("./routes/propietarioRouters/propietarioEventoReservaRouter"));
app.use("/api", require("./routes/propietarioRouters/propietarioReservaEventoLugarRouter"));
app.use("/api", require("./routes/propietarioRouters/categoriaUsuarioRolRouter"));

// Reportes
app.use("/api", require("./routes/reporteRoutes"));

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["https://frontendpopa.vercel.app", "http://localhost:5173"],
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
