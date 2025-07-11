/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testEnvironmentOptions: {
    verboseQuery: true,
  },
  testTimeout: 50000,
  setupFiles: ["<rootDir>/jest.setup.ts"],
  setupFilesAfterEnv: ["@quramy/prisma-fabbrica/scripts/jest-prisma"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
    "^.+\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!.*(uuid|@ngneat/falso|graphql-upload)/)"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/__tests__/helper/*.*",
    "/src/infrastructure/prisma/factories/__generated__/",
    "/src/infrastructure/prisma/seeds/",
    "/src/scripts/",
    "/src/utils/fetch.ts",
    "/src/utils/misc.ts",
    "/src/types/",
    "<rootDir>/dist/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^graphql-upload/GraphQLUpload.mjs$": "<rootDir>/src/__tests__/helper/graphql-upload-mock.js",
  },
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/helper/*.*",
    // "<rootDir>/src/__tests__/auth/",
    "<rootDir>/dist/",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
