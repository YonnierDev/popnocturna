// Importar las dependencias necesarias
const request = require('supertest');
const { app, server } = require('../../index'); // Importar app y server de index.js
const AutentiService = require('../../service/autentiService');

// Mock del servicio de autenticación
jest.mock('../../service/autentiService');

// Mostrar información de depuración
console.log('Iniciando pruebas de AutentiController');

// Mostrar la configuración de Jest
console.log('Jest config:', JSON.stringify(require('../../jest.config.js'), null, 2));

describe('AutentiController', () => {
  // Datos de prueba
  const usuarioMock = {
    id: 1,
    correo: 'test@example.com',
    rolid: 2,
    estado: true
  };

  // Cerrar el servidor después de las pruebas
  afterAll((done) => {
    server.close(done);
  });

  // Limpiar los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('debería devolver un token cuando las credenciales son correctas', async () => {
      // Configurar el mock del servicio
      AutentiService.login.mockResolvedValue({
        token: 'fake-jwt-token',
        usuario: usuarioMock
      });

      // Realizar la petición
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@example.com',
          contrasena: 'password123'
        });

      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'fake-jwt-token');
      expect(response.body).toHaveProperty('usuario');
      expect(AutentiService.login).toHaveBeenCalledWith({
        correo: 'test@example.com',
        contrasena: 'password123'
      });
    });

    it('debería devolver un error 401 cuando las credenciales son incorrectas', async () => {
      // Configurar el mock para que lance un error
      AutentiService.login.mockRejectedValue(new Error('Credenciales inválidas'));

      // Realizar la petición
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@example.com',
          contrasena: 'wrongpassword'
        });

      // Verificar la respuesta
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });
  });

  describe('POST /api/auth/registrar', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      // Datos de prueba para el registro
      const usuarioRegistro = {
        nombre: 'Nuevo',
        apellido: 'Usuario',
        correo: 'nuevo@example.com',
        contrasena: 'Password123!',
        rolid: 2
      };

      // Configurar el mock del servicio
      AutentiService.registrarUsuario.mockResolvedValue({
        id: 2,
        ...usuarioRegistro,
        estado: false
      });

      // Realizar la petición
      const response = await request(app)
        .post('/api/auth/registrar')
        .send(usuarioRegistro);

      // Verificar la respuesta
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.correo).toBe(usuarioRegistro.correo);
      expect(AutentiService.registrarUsuario).toHaveBeenCalledWith(usuarioRegistro);
    });

    it('debería devolver un error si faltan campos requeridos', async () => {
      // Datos de prueba incompletos
      const usuarioIncompleto = {
        nombre: 'Incompleto',
        // Falta apellido, correo, contraseña y rolid
      };

      // Realizar la petición
      const response = await request(app)
        .post('/api/auth/registrar')
        .send(usuarioIncompleto);

      // Verificar la respuesta
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });
  });
});