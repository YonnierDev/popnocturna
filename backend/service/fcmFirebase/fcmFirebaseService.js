const admin = require('firebase-admin');

// Configuración para producción (usando variables de entorno)
let serviceAccount;
const env = process.env.NODE_ENV || 'development';

// En producción, cargar desde variable de entorno
if (env === 'production') {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON || '{}');
  } catch (error) {
    console.error('Error parsing FIREBASE_CREDENTIALS_JSON:', error.message);
  }
} 
// En desarrollo, cargar desde archivo local
else {
  try {
    serviceAccount = require('../../config/nocturnapopayan-admin.json');
  } catch (error) {
    console.error('Error loading Firebase config file:', error.message);
  }
}

// Inicializar Firebase Admin si hay credenciales
if (serviceAccount && Object.keys(serviceAccount).length > 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error.message);
  }
}

/**
 * Envía una notificación push a un dispositivo
 */
const enviarNotificacion = async ({ token, titulo, cuerpo, imagen }) => {
  if (!admin.apps.length) {
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
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } }
    };

    const response = await admin.messaging().send(mensaje);
    return { success: true, response };
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.errorInfo || 'No hay detalles adicionales'
    };
  }
};

module.exports = { enviarNotificacion };