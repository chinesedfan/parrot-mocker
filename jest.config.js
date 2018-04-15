module.exports = {
    testPathIgnorePatterns: [
        '<rootDir>/test/util.js'
    ],
    coveragePathIgnorePatterns: [
        '<rootDir>/src/common/cookies.js',
        '<rootDir>/src/wrapper/',
        '<rootDir>/test/util.js',
        '<rootDir>/node_modules/'
    ],
    testEnvironment: 'node'
};
