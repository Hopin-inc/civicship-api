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
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    "node_modules/(?!.*(uuid|@ngneat/falso)/)",
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};