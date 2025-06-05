const { execSync } = require('child_process');

console.log('Ejecutando prueba directa...');
try {
  const result = execSync('npx jest --version');
  console.log('Versión de Jest:', result.toString());
  
  console.log('Ejecutando prueba simple...');
  const testResult = execSync('npx jest test-simple.test.js --no-cache --silent=false');
  console.log('Resultado de la prueba:', testResult.toString());
} catch (error) {
  console.error('Error al ejecutar la prueba:', error);
  if (error.stdout) console.error('Salida estándar:', error.stdout.toString());
  if (error.stderr) console.error('Error estándar:', error.stderr.toString());
}
