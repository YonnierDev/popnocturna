const sum = (a, b) => a + b;

test('suma 1 + 2 para dar 3', () => {
  expect(sum(1, 2)).toBe(3);
});

// Forzar un error para verificar que las pruebas se están ejecutando
test('prueba forzada que falla', () => {
  expect(true).toBe(false);
});
