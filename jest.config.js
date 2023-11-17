"use strict";

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["<rootDir>/test/integration/**/*.test.ts"],
    passWithNoTests: true,
    collectCoverage: true,
    collectCoverageFrom: ["**/src/**/*.ts"],
    coverageReporters: ["text", ["json", {file: "integration-final.json"}]],
    coverageDirectory: "./coverage/",
    clearMocks: true,
    coverageThreshold: {
        "global": {
            "branches": 75,
            "functions": 75,
            "lines": 75,
            "statements": -10
        }
    }
}
