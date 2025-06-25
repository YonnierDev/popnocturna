const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;
const env = process.env.NODE_ENV || 'development';

// En producción, intenta cargar desde variable de entorno
if (env === 'production') {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON || '{}');
  } catch (error) {
    console.error('Error parsing FIREBASE_CREDENTIALS_JSON:', error.message);
  }
} 
// En desarrollo, carga desde archivo
else {
  try {
    const configPath = path.resolve(process.cwd(), 'config/nocturnapopayan-admin.json');
    serviceAccount = require(configPath);
  } catch (error) {
    console.error('Error loading Firebase config file:', error.message);
  }
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error);
  }
}

const enviarNotificacion = async ({ token, titulo, cuerpo, imagen }) => {
  if (!admin.apps.length) {
    return { success: false, error: 'Firebase Admin no está inicializado' };
  }

  const mensaje = {
    notification: {
      title: titulo,
      body: cuerpo,
      image: imagen || undefined
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(mensaje);
    console.log('Notificación enviada:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return { success: false, error };
  }
};

module.exports = { enviarNotificacion };