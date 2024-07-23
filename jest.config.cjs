/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "@quramy/jest-prisma/environment",
  testEnvironmentOptions: {
    verboseQuery: true,
  },
  setupFilesAfterEnv: ["@quramy/prisma-fabbrica/scripts/jest-prisma"],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};