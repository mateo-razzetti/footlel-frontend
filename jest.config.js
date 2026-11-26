export default {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  collectCoverageFrom: [
    'services/**/*.js',
    '!services/apiConfig.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
};
