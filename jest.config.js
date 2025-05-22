/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "test-results", outputName: "junit.xml" }],
    ["jest-html-reporter", {
      pageTitle: "Test Report",
      outputPath: "test-results/test-report.html",
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ]
};
