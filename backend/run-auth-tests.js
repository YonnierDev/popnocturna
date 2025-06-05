const request = require('supertest');
const { app, server } = require('./index');

// Datos de prueba
const usuarioMock = {
  id: 1,
  correo: 'test@example.com',
  rolid: 2,
  estado: true,
  nombre: 'Test',
  apellido: 'User'
};

// Mock del servicio de autenticación
const AutentiService = require('./service/autentiService');
const originalLogin = AutentiService.login;

// Pruebas
async function runTests() {
  console.log('Iniciando pruebas de autenticación...');
  
  try {
    // Prueba de login exitoso
    console.log('\n--- Prueba 1: Login exitoso ---');
    
    // Mock manual de la función login
    AutentiService.login = async () => ({
      token: 'fake-jwt-token',
      usuario: usuarioMock
    });
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'test@example.com',
        contrasena: 'password123'
      });
    
    console.log('Status:', loginResponse.status);
    console.log('Body:', JSON.stringify(loginResponse.body, null, 2));
    
    // Verificar la respuesta
    if (loginResponse.status === 200 && 
        loginResponse.body.token && 
        loginResponse.body.usuario) {
      console.log('✅ Prueba de login exitoso: PASÓ');
    } else {
      console.error('❌ Prueba de login exitoso: FALLÓ');
    }
    
    // Prueba de login fallido
    console.log('\n--- Prueba 2: Login fallido ---');
    
    // Mock manual para simular un error
    AutentiService.login = async () => {
      throw new Error('Credenciales inválidas');
    };
    
    try {
      const failedLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@example.com',
          contrasena: 'wrongpassword'
        });
      
      console.log('Status:', failedLoginResponse.status);
      console.log('Body:', JSON.stringify(failedLoginResponse.body, null, 2));
      
      // Verificar la respuesta de error
      if (failedLoginResponse.status === 401) {
        console.log('✅ Prueba de login fallido: PASÓ');
      } else {
        console.error('❌ Prueba de login fallido: FALLÓ - Se esperaba un error 401');
      }
    } catch (error) {
      console.error('Error en prueba de login fallido:', error.message);
      console.error('❌ Prueba de login fallido: FALLÓ - Error inesperado');
    }
    
    console.log('\n--- Pruebas completadas ---');
  } catch (error) {
    console.error('Error en las pruebas:', error);
  } finally {
    // Restaurar la función original
    AutentiService.login = originalLogin;
    
    // Cerrar el servidor
    server.close(() => {
      console.log('Servidor cerrado');
      process.exit(0);
    });
  }
}

// Ejecutar las pruebas
runTests();
