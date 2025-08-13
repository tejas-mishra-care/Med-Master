/** @type {import('jest').Config} */
const config = {
  // Collect coverage from all JS, JSX, TS, and TSX files
  // Ignore declaration files, node_modules, and distribution folders
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // Configure module name mappings for handling various imports
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    // Use identity-obj-proxy to mock CSS Modules
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|svg)$': `<rootDir>/__mocks__/fileMock.js`,

    // Handle module aliases
    // Map @/components to the components directory
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  // Ignore test paths in node_modules, .next, and the e2e test directory
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/e2e/'],
  testEnvironment: 'jsdom',
  // Configure transformations for file types using babel-jest with the Next.js preset
  transform: {
    // Use babel-jest to transpile tests with the Next.js babel preset
    // https://jestjs.io/docs/configuration#transform-options-swc
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    // Ignore CSS Module imports during transformation
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// Export the configuration
module.exports = config;