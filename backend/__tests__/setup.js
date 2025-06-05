// Configuración para las pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Configurar console.log para que no muestre mensajes en las pruebas
console.log = () => {}; // Silenciar console.log
