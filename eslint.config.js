import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import tsdoc from 'eslint-plugin-tsdoc';
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { tsdoc },
    rules: {
      'tsdoc/syntax': 'warn',
    }
  },
  {
    languageOptions: {
      globals: globals.node,
      parser: parserTs,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    plugins: { "@stylistic": stylistic },
    rules: {
      // '@stylistic/array-bracket-spacing': [
      // 	'error',
      // 	'always',
      // 	{
      // 		'arraysInArrays': false,
      // 		'objectsInArrays': false,
      // 		'singleValue': false
      // 	}
      // ],
      // '@stylistic/block-spacing': ['error'],
      // '@stylistic/comma-dangle': [
      // 	'error',
      // 	'never'
      // ],
      // '@stylistic/comma-spacing': [
      // 	'error',
      // 	{
      // 		'before': false,
      // 		'after': true
      // 	}
      // ],
      // '@stylistic/brace-style': [
      // 	'error',
      // 	'stroustrup'
      // ],
      // '@stylistic/indent': [
      // 	'error',
      // 	'tab'
      // ],
      // '@stylistic/no-extra-semi': ['error'],
      // '@stylistic/space-infix-ops': ['error'],
      // '@stylistic/semi': [
      // 	'error',
      // 	'always'
      // ],
      // '@stylistic/key-spacing': [
      // 	'error',
      // 	{
      // 		'beforeColon': false,
      // 		'afterColon': true,
      // 		'mode': 'strict'
      // 	}
      // ],
      // '@stylistic/linebreak-style': [
      // 	'error',
      // 	'unix'
      // ],
      // '@stylistic/max-len': [
      // 	'error',
      // 	{
      // 		'code': 160,
      // 		'ignoreStrings': true,
      // 		'ignoreComments': true,
      // 		'ignoreTemplateLiterals': true
      // 	}
      // ],
      // '@stylistic/padding-line-between-statements': [
      // 	'error',
      // 	{
      // 		'blankLine': 'always',
      // 		'prev': '*',
      // 		'next': 'function'
      // 	},
      // 	{
      // 		'blankLine': 'always',
      // 		'prev': '*',
      // 		'next': 'export'
      // 	}
      // ],
      // '@stylistic/object-curly-newline': [
      // 	'error',
      // 	{
      // 		'ObjectExpression': {
      // 			'multiline': true,
      // 			'minProperties': 3
      // 		},
      // 		'ObjectPattern': {
      // 			'multiline': true,
      // 			'minProperties': 3
      // 		},
      // 		'ImportDeclaration': {
      // 			'multiline': true,
      // 			'minProperties': 3
      // 		},
      // 		'ExportDeclaration': { 'multiline': true }
      // 	}
      // ],
      // '@stylistic/object-curly-spacing': [
      // 	'error',
      // 	'always'
      // ],
      // '@stylistic/space-before-function-paren': [
      // 	'error',
      // 	{
      // 		'anonymous': 'never',
      // 		'named': 'never',
      // 		'asyncArrow': 'always'
      // 	}
      // ],
      // '@stylistic/switch-colon-spacing': [
      // 	'error',
      // 	{
      // 		'after': true,
      // 		'before': false
      // 	}
      // ],
      // '@stylistic/type-annotation-spacing': [
      // 	'error',
      // 	{
      // 		'before': false,
      // 		'after': true,
      // 		'overrides': {
      // 			'arrow': {
      // 				'before': true,
      // 				'after': true
      // 			}
      // 		}
      // 	}
      // ],
      // '@stylistic/jsx-quotes': [
      // 	'error',
      // 	'prefer-single'
      // ],
      // '@stylistic/quotes': [
      // 	'error',
      // 	'single',
      // 	{ 'allowTemplateLiterals': true }
      // ],
      // 'curly': [
      // 	'error',
      // 	'multi'
      // ],
      "class-methods-use-this": 0,
      "max-classes-per-file": "off",
      "no-await-in-loop": "off",
      "no-bitwise": "off",
      "no-console": "off",
      "no-continue": "off",
      "no-tabs": "off",
      "no-param-reassign": 0,
      "no-plusplus": 0,
      "no-prototype-builtins": "off",
      "no-underscore-dangle": "off",
      "no-multi-assign": "off",
      "no-extend-native": "off",
      "no-restricted-syntax": "off",
      "no-unused-vars": "off",
      "no-nested-ternary": "off",
      "no-promise-executor-return": "off",
    },
  }
);
