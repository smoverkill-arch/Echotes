process.env.TZ = "UTC";

module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],
  moduleNameMapper: {
    "^react-native-safe-area-context$": "<rootDir>/__mocks__/react-native-safe-area-context.js",
    "^react-native-pager-view$": "<rootDir>/__mocks__/react-native-pager-view.js",
  },
};
