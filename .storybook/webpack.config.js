const path = require('path')
const dotenv = require('dotenv-webpack')
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin')
module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: 'babel-loader',
    exclude: /(node_modules|bower_components)/,
    options: {
      plugins: ['@babel/proposal-class-properties', '@babel/transform-runtime'],
      presets: [
        ['@babel/preset-typescript',
          { isTSX: true, allExtensions: true }],
        '@babel/preset-react', '@babel/preset-env']
    }
  })
  config.plugins.push(new TSDocgenPlugin()) // optional
  config.plugins.push(new dotenv())

  config.resolve.extensions.push('.ts', '.tsx')
  return config
}
