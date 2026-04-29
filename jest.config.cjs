/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testEnvironmentOptions: {
    verboseQuery: true,
  },
  testTimeout: 50000,
  // ts-jest の transform 結果をプロジェクト内 .jest-cache に保存し、CI で
  // actions/cache 経由で永続化することで test job の transform overhead を削減。
  cacheDirectory: "<rootDir>/.jest-cache",
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
  transformIgnorePatterns: ["node_modules/(?!.*(uuid|@ngneat/falso)/)"],
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
  },
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/helper/*.*",
    "<rootDir>/src/__tests__/.*/helpers\\.ts",
    "<rootDir>/src/__tests__/.*/fixtures\\.ts",
    "<rootDir>/dist/",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
