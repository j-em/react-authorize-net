const srcConfig = require('./config.src')

module.exports = Object.assign({}, srcConfig, {
  collectCoverage: false,
  moduleNameMapper: {
    '^../src$': `<rootDir>/es/react-authorize-net.js`,
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.ts'
  }
})
