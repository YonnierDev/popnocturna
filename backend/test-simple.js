const assert = require('assert');

// Prueba simple
function sum(a, b) {
  return a + b;
}

// Ejecutar la prueba
try {
  console.log('Iniciando prueba simple...');
  const result = sum(1, 2);
  console.log('Resultado de la suma:', result);
  assert.strictEqual(result, 3, 'La suma de 1 + 2 debe ser 3');
  console.log('¡Prueba exitosa!');
  process.exit(0);
} catch (error) {
  console.error('Error en la prueba:', error.message);
  process.exit(1);
}
