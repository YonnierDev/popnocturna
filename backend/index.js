require("dotenv").config();
const express = require("express");
const cors = require("cors");

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
app.use("/api", require("./routes/reservaRouter"));
app.use("/api", require("./routes/comentarioRoutes"));
app.use("/api", require("./routes/autentiRouter"));
app.use("/api", require("./routes/propietarioRoutes"));
app.use("/api", require("./routes/detailsRouters/usuarioDetalleRouter"));
app.use("/api", require("./routes/propietarioRouters/categoriaUsuarioRolRouter"));
app.use("/api", require("./routes/propietarioRouters/reservaUsuarioEventoLugarRouter"));

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

module.exports = app;
