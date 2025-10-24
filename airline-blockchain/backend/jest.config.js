module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js", "!src/services/abi.json"],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 70,
      branches: 60
    }
  }
};