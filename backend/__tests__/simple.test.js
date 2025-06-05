const sum = (a, b) => a + b;

test('suma 1 + 2 para dar 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('prueba forzada que falla', () => {
  // Esta prueba está diseñada para fallar
  console.log('Ejecutando prueba que falla...');
  expect(true).toBe(false);
});
