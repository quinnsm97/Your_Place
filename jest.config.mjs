export default {
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.js"],
};