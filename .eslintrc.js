
module.exports = {
  // Specifies that this is the root ESLint configuration file. ESLint will stop looking for configuration files in parent directories.
  root: true,
  
  // Defines the environments your code will run in. This predefines global variables for each environment.
  env: {
    browser: true, // Browser global variables like `window` and `document`.
    es2021: true,  // Adds all ECMAScript 2021 globals and automatically sets `ecmaVersion` parser option to 12.
    node: true,    // Node.js global variables and Node.js scoping (e.g., `process.env`).
  },
  
  // Extends a set of recommended ESLint rule configurations.
  extends: [
    'eslint:recommended', // Core ESLint rules that report common problems.
    'plugin:@typescript-eslint/recommended', // Recommended rules for TypeScript from the `@typescript-eslint/eslint-plugin`.
    'plugin:react/recommended', // Recommended rules for React from `eslint-plugin-react`.
    'plugin:react-hooks/recommended', // Enforces the Rules of Hooks from `eslint-plugin-react-hooks`.
  ],
  
  // Specifies the parser ESLint should use to understand your code.
  parser: '@typescript-eslint/parser', // This parser allows ESLint to lint TypeScript code.
  
  // Configuration options for the parser.
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Enables parsing of JSX.
    },
    ecmaVersion: 12, // Specifies the ECMAScript version to use (redundant with `env.es2021: true` but good for clarity).
    sourceType: 'module', // Allows for the use of imports.
  },
  
  // Specifies additional plugins to use. Plugins can provide custom rules.
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  
  // Custom rules to override or add to the extended configurations.
  rules: {
    // ---- Code Style & Consistency ----
    'comma-dangle': ['error', 'never'], // Disallows trailing commas.
    'quotes': ['error', 'single'], // Enforces the use of single quotes for strings.
    'semi': ['error', 'always'], // Requires semicolons at the end of statements.
    'no-trailing-spaces': 'error', // Disallows trailing whitespace at the end of lines.
    'indent': ['error', 2, { SwitchCase: 1 }], // Enforces a consistent indentation level of 2 spaces.
    'prefer-const': 'error', // Requires `const` instead of `let` where a variable is not reassigned.
    'no-constant-condition': ['error', { checkLoops: false }], // Disallows constant expressions in conditions, except in loops for flexibility.

    // ---- React Specific Rules ----
    'react/react-in-jsx-scope': 'off', // Not needed for the new JSX transform in React 17+.
    'react/prop-types': 'off', // Disabled because PropTypes are replaced by TypeScript interfaces.
    'react/jsx-uses-react': 'off', // Not needed for the new JSX transform.
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }], // Enforce curly braces or not in JSX props and children.
    'react/self-closing-comp': ['error', { component: true, html: true }], // Enforces components to be self-closing when they have no children.
    'react/no-unescaped-entities': 'off', // Allows unescaped entities like apostrophes in JSX.
    'jsx-quotes': ['error', 'double'], // Enforces the use of double quotes for JSX attributes.
    
    // ---- TypeScript Specific Rules ----
    '@typescript-eslint/no-explicit-any': 'off', // Allows the use of the `any` type. Adjust based on project strictness needs.
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Allows functions to not have explicit return types, which can be verbose for React functional components.
    '@typescript-eslint/no-non-null-assertion': 'off', // Allows the use of the non-null assertion operator (`!`), which is common for `process.env`.
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Warns about unused variables unless they are prefixed with an underscore.
    '@typescript-eslint/no-floating-promises': 'error', // Requires all Promise-returning functions to be awaited or explicitly handled.
  },
  
  // Settings to be shared across all rules.
  settings: {
    react: {
      version: 'detect', // Automatically detect the version of React to use.
    },
  },

  // Files and directories to be ignored by ESLint.
  ignorePatterns: [
    'node_modules/', // Standard directory to ignore.
    'dist/', // Build output directory.
    '.eslintrc.js', // The config file itself.
    'metadata.json', // Metadata file which is not source code.
  ]
};
