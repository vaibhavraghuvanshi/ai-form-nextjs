import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customConfig: Config = {
  // Run jest.setup.ts after the test framework is installed in the environment
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  testEnvironment: "jest-environment-jsdom",

  // Path aliases matching tsconfig.json
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // CSS / style files
    "\\.css$": "identity-obj-proxy",
    // Static assets
    "\\.(jpg|jpeg|png|gif|svg|webp|avif|ico|bmp|ttf|woff|woff2|eot)$":
      "<rootDir>/__mocks__/fileMock.ts",
    // Lottie JSON animation
    "^@/Thanks\\.json$": "<rootDir>/__mocks__/lottieMock.ts",
  },

  // Collect coverage from relevant source files
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/app/layout.tsx",
    "!src/app/globals.css",
  ],

  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  // Directories to ignore
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Transform ignore: allow next/jest to handle most transforms;
  // explicitly transpile ESM packages if needed
  transformIgnorePatterns: [
    "/node_modules/(?!(lottie-react|@lottiefiles)/)",
  ],

  // Module directories for bare imports
  moduleDirectories: ["node_modules", "<rootDir>/"],
};

export default createJestConfig(customConfig);
