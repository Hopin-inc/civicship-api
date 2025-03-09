/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testEnvironmentOptions: {
    verboseQuery: true,
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
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
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/helper/*.*'
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};