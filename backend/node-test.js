const test = require('node:test');
const assert = require('node:assert');

// Prueba simple
console.log('Iniciando prueba con Node.js test runner...');

test('prueba de suma', (t) => {
  console.log('Ejecutando prueba de suma...');
  assert.strictEqual(1 + 2, 3);
  console.log('¡Prueba exitosa!');
});

test('prueba que falla', (t) => {
  console.log('Ejecutando prueba que falla...');
  assert.strictEqual(true, false, 'Esta prueba está diseñada para fallar');
});
