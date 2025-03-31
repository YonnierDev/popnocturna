require("dotenv").config();
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api", require("./routes/rolRouter"));
app.use("/api", require("./routes/usuarioRoutes"));
app.use("/api", require("./routes/categoriaRoutes"));
app.use("/api", require("./routes/lugarRoutes"));
app.use("/api", require("./routes/eventoRoutes")); 
app.use("/api", require("./routes/calificacionRoutes"));
app.use("/api", require("./routes/reservaRouter"));
app.use("/api", require("./routes/comentarioRoutes"));
app.use("/api", require("./routes/propietarioRoutes"));


// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
