const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// 1. Configuración de rutas
const configPath = path.resolve(__dirname, '../../config/nocturnapopayan-admin.json');
console.log(' Buscando credenciales en:', configPath);

// 2. Cargar credenciales
let serviceAccount;
try {
  if (!fs.existsSync(configPath)) {
    throw new Error(` No se encontró el archivo de credenciales en: ${configPath}`);
  }

  const fileContent = fs.readFileSync(configPath, 'utf8');
  serviceAccount = JSON.parse(fileContent);
  
  console.log(' Credenciales cargadas correctamente');
  console.log(`   Proyecto: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  
  // Validar credenciales
  if (!serviceAccount.private_key || !serviceAccount.project_id || !serviceAccount.client_email) {
    throw new Error('Credenciales incompletas. Faltan campos requeridos.');
  }
  
} catch (error) {
  console.error(' Error al cargar credenciales:', error.message);
  process.exit(1);
}

// 3. Inicializar Firebase Admin
try {
  // Asegurarse de que no hay aplicaciones inicializadas
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      }),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log(' Firebase Admin inicializado correctamente');
  } else {
    console.log(' Firebase Admin ya estaba inicializado');
  }
} catch (error) {
  console.error(' Error al inicializar Firebase Admin:');
  console.error('- Mensaje:', error.message);
  if (error.errorInfo) {
    console.error('- Código:', error.errorInfo.code);
    console.error('- Mensaje:', error.errorInfo.message);
  }
  process.exit(1);
}

/**
 * Envía una notificación push a un dispositivo
 * @param {Object} params - Parámetros de la notificación
 * @param {string} params.token - Token del dispositivo
 * @param {string} params.titulo - Título de la notificación
 * @param {string} params.cuerpo - Cuerpo del mensaje
 * @param {string} [params.imagen] - URL de la imagen (opcional)
 * @returns {Promise<Object>} Resultado del envío
 */
const enviarNotificacion = async ({ token, titulo, cuerpo, imagen }) => {
  if (!admin.apps.length) {
    console.error(' Firebase Admin no está inicializado');
    return { success: false, error: 'Firebase Admin no está inicializado' };
  }

  try {
    const mensaje = {
      notification: {
        title: titulo,
        body: cuerpo,
        ...(imagen && { image: imagen })
      },
      token: token,
      android: {
        priority: 'high'
      },
      apns: {
        headers: {
          'apns-priority': '10'
        }
      }
    };

    console.log(` Enviando notificación a ${token.substring(0, 10)}...`);
    const response = await admin.messaging().send(mensaje);
    console.log(' Notificación enviada correctamente');
    return { success: true, response };
    
  } catch (error) {
    console.error(' Error al enviar notificación:');
    console.error('- Mensaje:', error.message);
    if (error.errorInfo) {
      console.error('- Código:', error.errorInfo.code);
      console.error('- Mensaje:', error.errorInfo.message);
    }
    return { 
      success: false, 
      error: error.message,
      details: error.errorInfo || 'No hay detalles adicionales'
    };
  }
};

module.exports = { enviarNotificacion };