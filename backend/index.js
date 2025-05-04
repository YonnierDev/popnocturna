require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
// Configurar Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET','POST','PATCH','DELETE'] } });
app.set('io', io);

// Servir archivos estáticos (para socket-test.html)
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO: manejar nuevas conexiones
io.on('connection', socket => {
  console.log('Nuevo cliente conectado:', socket.id);
  // permitir que el cliente se una a su sala personal
  socket.on('join', ({ usuarioid }) => {
    const room = `usuario-${usuarioid}`;
    socket.join(room);
    console.log(`Socket ${socket.id} entró en sala ${room}`);
  });

  // Manejar sala de administradores
  socket.on('join-admin-room', ({ rol }) => {
    if (rol === '1' || rol === '2') {
      socket.join('admin-room');
      console.log(`Socket ${socket.id} entró en sala admin-room`);
    }
  });

  // Manejar sala de usuarios
  socket.on('join-usuario-room', ({ rol }) => {
    if (rol === '8') {
      socket.join('usuario-room');
      console.log(`Socket ${socket.id} entró en sala usuario-room`);
    }
  });
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