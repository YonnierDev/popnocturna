module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['controllers/**/*.js', 'service/**/*.js'],
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 10000,
  verbose: true,
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
