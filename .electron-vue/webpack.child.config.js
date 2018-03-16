'use strict'

process.env.BABEL_ENV = 'child'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BabiliWebpackPlugin = require('babili-webpack-plugin')

const fs = require("fs");

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = ['vue']

let files = fs.readdirSync(path.join(__dirname, "../src/child/processes"))

let childConfig = {
  devtool: '#cheap-module-eval-source-map',
  entry: files.reduce((entry, file) => {
    let name = file.substring(0, file.indexOf("."));
    return {...entry, [name]: path.join(__dirname, "../src/child/processes", file)}
  }, {}),
  externals: [
    ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron/child')
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.json', '.node']
  },
  target: 'node'
}

module.exports = childConfig
