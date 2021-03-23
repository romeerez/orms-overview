export default {
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['./jest-setup.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
