import { resolve } from 'path'
import { DefinePlugin, BannerPlugin } from 'webpack'

import { argvFlag, runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'
import { compileWithWebpack, commonFlag } from 'dev-dep-tool/library/webpack'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, isProduction, profileOutput, assetMapOutput } = await commonFlag({ argvFlag, profileOutput: fromRoot('.temp-gitignore/profile-stat-bin.json'), logger })

  const babelOption = {
    configFile: false,
    babelrc: false,
    cacheDirectory: isProduction,
    presets: [ [ '@babel/env', { targets: { node: '8.8' }, modules: false } ] ]
  }

  const config = {
    mode,
    bail: isProduction,
    target: 'node', // support node main modules like 'fs'
    output: { path: fromOutput('bin'), filename: '[name].js' },
    entry: { index: 'source-bin/index' },
    resolve: { alias: { 'source-bin': fromRoot('source-bin') } },
    externals: { 'source': `require('../library')` },
    module: { rules: [ { test: /\.js$/, use: [ { loader: 'babel-loader', options: babelOption } ] } ] },
    plugins: [
      new DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(mode), '__DEV__': !isProduction }),
      new BannerPlugin({ banner: `#!/usr/bin/env node`, raw: true })
    ],
    optimization: { minimize: false }
  }

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, assetMapOutput, logger })
}, getLogger(`webpack`))