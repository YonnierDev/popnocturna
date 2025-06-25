const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Cargar las credenciales desde la variable de entorno
const serviceAccount = require(path.resolve(process.cwd(), process.env.FIREBASE_CREDENTIALS_PATH));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const enviarNotificacion = async ({ token, titulo, cuerpo, imagen }) => {
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