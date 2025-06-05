// Importar el servicio que vamos a probar
const AutentiService = require('../../service/autentiService');
const UsuarioService = require('../../service/usuarioService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock de las dependencias
jest.mock('../../service/usuarioService');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AutentiService', () => {
  // Datos de prueba
  const usuarioMock = {
    id: 1,
    correo: 'test@example.com',
    contrasena: 'hashedpassword',
    rolid: 2,
    estado: true,
    save: jest.fn()
  };

  // Limpiar los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debería devolver un token cuando las credenciales son correctas', async () => {
      // Configurar los mocks
      UsuarioService.buscarPorCorreo.mockResolvedValue(usuarioMock);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt-token');

      // Llamar al método que estamos probando
      const resultado = await AutentiService.login({
        correo: 'test@example.com',
        contrasena: 'password123'
      });

      // Verificar los resultados
      expect(UsuarioService.buscarPorCorreo).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, correo: 'test@example.com', rol: 2 },
        process.env.JWT_SECRET || 'secreto',
        { expiresIn: '2h' }
      );
      expect(resultado).toHaveProperty('token', 'fake-jwt-token');
      expect(resultado).toHaveProperty('usuario');
    });

    it('debería lanzar un error si el usuario no existe', async () => {
      // Configurar el mock para que devuelva null (usuario no encontrado)
      UsuarioService.buscarPorCorreo.mockResolvedValue(null);

      // Verificar que se lance el error
      await expect(
        AutentiService.login({
          correo: 'nonexistent@example.com',
          contrasena: 'password123'
        })
      ).rejects.toThrow('Usuario no validado o no existe');
    });

    it('debería lanzar un error si la contraseña es incorrecta', async () => {
      // Configurar los mocks
      UsuarioService.buscarPorCorreo.mockResolvedValue(usuarioMock);
      bcrypt.compare.mockResolvedValue(false);

      // Verificar que se lance el error
      await expect(
        AutentiService.login({
          correo: 'test@example.com',
          contrasena: 'wrongpassword'
        })
      ).rejects.toThrow('Contraseña incorrecta');
    });
  });
});