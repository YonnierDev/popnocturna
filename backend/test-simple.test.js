const sum = (a, b) => a + b;

test('suma 1 + 2 para dar 3', () => {
  console.log('Ejecutando prueba de suma...');
  expect(sum(1, 2)).toBe(3);
});

test('prueba forzada que falla', () => {
  console.log('Ejecutando prueba que falla...');
  expect(true).toBe(false);
});
