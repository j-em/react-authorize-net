// @ts-check

import { DEFAULT_EXTENSIONS } from '@babel/core'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import sourcemaps from 'rollup-plugin-sourcemaps'
import includePaths from 'rollup-plugin-includepaths'
import postcss from 'rollup-plugin-postcss'
import url from "rollup-plugin-url"
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'

const getExternal = (bundleType) => {
  const peerDependencies = Object.keys(pkg.peerDependencies)
  const dependencies = Object.keys(pkg.dependencies)

  const makeExternalPredicate = externals => {
    if (externals.length === 0) {
      return () => false
    }
    const pattern = new RegExp(`^(${externals.join('|')})($|/)`)
    return id => pattern.test(id)
  }

  return makeExternalPredicate([...peerDependencies, ...dependencies])
}

const getBabelConfig = () => {
  const options = {
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [
      ['@babel/env', { loose: true, modules: false }],
      '@babel/react',
      '@babel/typescript'
    ],
    plugins: [
      ['@babel/proposal-class-properties', { loose: true }],
      ['transform-react-remove-prop-types', { mode: 'wrap' }],
      ['babel-plugin-styled-components'],
      '@babel/transform-runtime'
    ],
    runtimeHelpers: true,
    extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx']
  }
  return options
}

const config = {
  input: './src/index.ts',
  external: getExternal(),
  output: {
    file: 'dist/react-authorize-net.js',
    format: 'es',
    name: 'react-authorize-net',
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    url({ limit: 16 * 1024, include: ["**/*.woff2"] }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'react-is': ['isElement', 'isValidElementType', 'ForwardRef'],
        'node_modules/prop-types/index.js': [
          'any',
          'array',
          'arrayOf',
          'bool',
          'element',
          'exact',
          'func',
          'instanceOf',
          'node',
          'number',
          'object',
          'objectOf',
          'oneOf',
          'oneOfType',
          'shape',
          'string',
          'symbol'
        ]
      }
    }),
    postcss({ plugins: [], inject: false }),
    babel(getBabelConfig()),
    includePaths({path: './src', extensions: ['.tsx', '.ts']}),
    sourcemaps(),
    filesize()
  ]
}

export default config
