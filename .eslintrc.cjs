module.exports = {
  root: true,
  ignorePatterns: ["/testext/"],
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
  },
  globals: {
    ext: true,
  },
  plugins: ["eslint-plugin-html", "mocha"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["eslint:recommended", "prettier"],
  rules: {
    "brace-style": ["error", "1tbs"],
    "max-len": ["error", { code: 120, ignoreUrls: true, ignoreRegExpLiterals: true }],
    // Prefer eslint-disable-next-line: prettier can reformat inline disable
    // comments onto the next line, silently breaking them.
    "no-warning-comments": ["error", { terms: ["eslint-disable-line"], location: "anywhere" }],
    curly: ["error", "all"],
    "no-array-constructor": "error",
    "no-implied-eval": "error",
    "no-redeclare": ["error", { builtinGlobals: false }],
    "no-throw-literal": "error",
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    "no-unused-vars": [
      "error",
      {
        args: "none",
        caughtErrors: "none",
        ignoreRestSiblings: true,
        vars: "all",
      },
    ],
    "no-use-before-define": ["error", { functions: false, classes: false, variables: false }],
    "no-useless-constructor": "error",
    "prefer-promise-reject-errors": "error",
  },
  settings: {
    "html/html-extensions": [".html", ".tmpl"],
    "html/indent": "+2",
    "html/report-bad-indent": "error",
  },
  overrides: [
    {
      files: ["static/**/*.js", "pages/**/*.tmpl"],
      parserOptions: { sourceType: "script" },
      globals: {
        removeWaitingContent: "readonly",
        expectedParameter: "readonly",
        expectedPageView: "readonly",
        verifyTargetRemoved: "readonly",
      },
    },
    {
      files: ["test/extension-tests/**/*.js"],
      env: { mocha: true, node: true },
      globals: { driver: true, extension: true, browserDetails: true },
    },
    {
      files: ["endpoints/**/*.js"],
      env: { node: true },
    },
  ],
};
