import { resolve } from 'path'
import { execSync } from 'child_process'

import { getPathGlobalNpmNodeModules } from '@dr-js/dev/module/node/npm/path'
import { COMBO_COMMAND_CONFIG_MAP } from '@dr-js/dev/module/node/npm/comboCommand'
import { npxLazy as __npxLazy } from '@dr-js/dev/module/node/npm/npxLazy'

import { tryRequire } from '@dr-js/core/module/env/tryRequire'
import { indentLine } from '@dr-js/core/module/common/string'

const DEFAULT_PAD_LOG = __DEV__
  ? (padLevel, ...args) => console.log(`${'  '.repeat(padLevel)}${args.join(' ')}`)
  : () => {}

// inspired by: https://github.com/zkat/npx/blob/latest/bin/index.js#L6

// `global/or/local/node_modules/PACKAGE-NAME/library-or-source/../../`
const PATH_NODE_MODULES = resolve(__dirname, '../../') // maybe global, maybe local, depend on where this package is installed

const getPathNpmNodeModules = getPathGlobalNpmNodeModules

const getPathGlobalNodeModules = () => resolve(getPathNpmNodeModules(), '../../')

const getTryRequireGlobal = (pathGlobalNodeModules = getPathGlobalNodeModules()) =>
  (...pathList) => tryRequire(resolve(pathGlobalNodeModules, ...pathList))

const npmCombo = (comboNameList, padLog = DEFAULT_PAD_LOG) => {
  if ([ 'help', 'h', 'list', 'ls', 'l' ].includes(comboNameList[ 0 ])) return console.log(`  - ${Object.keys(COMBO_COMMAND_CONFIG_MAP).join(', ')}`)

  for (const comboName of comboNameList) {
    const commandList = COMBO_COMMAND_CONFIG_MAP[ comboName ]
    if (!commandList) throw new Error(`[combo] invalid comboName: ${comboName}`)
    padLog(0, `[combo] ${comboName}`)
    for (const [ command, message ] of commandList) {
      padLog(1, `$ ${command}   # ${message}`)
      const output = String(execSync(command)).trimEnd()
      output && padLog(0, indentLine(output, '    '))
    }
  }
}

const npxLazy = ([ packageAndVersion, ...extraArgs ], padLog = DEFAULT_PAD_LOG) => __npxLazy({
  argList: [ packageAndVersion, ...extraArgs ],
  tabLog: padLog
})

export {
  PATH_NODE_MODULES,
  getPathNpmNodeModules,
  getPathGlobalNodeModules,
  getTryRequireGlobal,
  npmCombo,
  npxLazy
}
