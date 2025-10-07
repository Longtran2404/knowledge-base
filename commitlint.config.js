module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, missing semi colons, etc
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding tests
        'chore',    // Maintenance
        'revert',   // Revert previous commit
        'build',    // Build system changes
        'ci',       // CI/CD changes
      ],
    ],
    'subject-case': [0], // Allow any case
    'subject-max-length': [2, 'always', 100],
  },
};