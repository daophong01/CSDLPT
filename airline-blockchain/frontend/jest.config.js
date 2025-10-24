module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: true,
  collectCoverageFrom: ["components/**/*.jsx", "services/**/*.js", "pages/**/*.js"],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 70,
      branches: 60
    }
  },
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  }
};