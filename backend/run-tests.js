// Ejecutar pruebas manualmente
const { exec } = require('child_process');

console.log('Iniciando pruebas...');

// Ejecutar Jest con salida detallada
const jest = exec('npx jest --config=jest.config.cjs --runInBand --verbose --no-coverage', (error, stdout, stderr) => {
  console.log('Salida de Jest:');
  console.log(stdout);
  
  if (error) {
    console.error('Error ejecutando Jest:', error);
    return;
  }
  
  if (stderr) {
    console.error('Error estándar de Jest:');
    console.error(stderr);
  }
});

jest.stdout.pipe(process.stdout);
jest.stderr.pipe(process.stderr);
