require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api", require("./routes/calificacionRoutes"));
app.use("/api", require("./routes/comentarioRoutes"));

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
