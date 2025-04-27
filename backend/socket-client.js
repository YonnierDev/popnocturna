// socket-client.js
// Cliente simple para probar notificaciones de Socket.IO
const { io } = require("socket.io-client");

// Conectar al servidor (ajusta puerto si es distinto)
const socket = io("http://localhost:7000");

socket.on("connect", () => {
  console.log("🟢 Conectado con ID de socket:", socket.id);
});

socket.on("notificaciones-reportes", data => {
  console.log("🔔 notificaciones-reportes:", data);
});

socket.on("notificaciones-lugares", data => {
  console.log("🔔 notificaciones-lugares:", data);
});

socket.on("disconnect", () => {
  console.log("🔴 Desconectado");
});
