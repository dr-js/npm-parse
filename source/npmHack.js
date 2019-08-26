import { resolve } from 'path'
import { statSync } from 'fs'
import { execSync } from 'child_process'
import { tryRequire } from 'dr-js/module/env/tryRequire'
import { indentLine } from 'dr-js/module/common/string'

const DEFAULT_PAD_LOG = __DEV__
  ? (padLevel, ...args) => console.log(`${'  '.repeat(padLevel)}${args.join(' ')}`)
  : () => {}

// inspired by: https://github.com/zkat/npx/blob/latest/bin/index.js#L6

// `global/or/local/node_modules/PACKAGE-NAME/library-or-source/../../`
const PATH_NODE_MODULES = resolve(__dirname, '../../') // maybe global, maybe local, depend on where this package is installed

const getPathNpmNodeModules = () => {
  const derivedPath = resolve(PATH_NODE_MODULES, 'npm/node_modules/') // mostly be global installed (who install a local version?) // TODO: need test
  if (statSync(derivedPath).isDirectory()) return derivedPath // bingo! // TODO: may be too simple?

  // slow but should be right
  return resolve(String(execSync('npm root -g')).trim(), 'npm/node_modules/')
}

const getPathGlobalNodeModules = () => resolve(getPathNpmNodeModules(), '../../')

const getTryRequireGlobal = (pathGlobalNodeModules = getPathGlobalNodeModules()) =>
  (...pathList) => tryRequire(resolve(pathGlobalNodeModules, ...pathList))

const NPM_COMBO_COMMAND_LIST_MAP = {} // TODO: add more combo?
NPM_COMBO_COMMAND_LIST_MAP[ 'config' ] = NPM_COMBO_COMMAND_LIST_MAP[ 'c' ] = [
  [ 'npm config set update-notifier false', 'per-user config, stop npm auto check for update, good for server' ],
  [ 'npm config list', 'list non-default config' ]
]
NPM_COMBO_COMMAND_LIST_MAP[ 'install-offline' ] = NPM_COMBO_COMMAND_LIST_MAP[ 'io' ] = [
  [ 'npm i --prefer-offline', 'prefer local version when install' ]
]
NPM_COMBO_COMMAND_LIST_MAP[ 'package-dedupe' ] = NPM_COMBO_COMMAND_LIST_MAP[ 'ddp' ] = [
  [ 'npm i', 'first install' ],
  [ 'npm ddp', 'try dedupe, may change "package-lock.json"' ],
  [ 'npm i', 'restore "package-lock.json"' ]
]

const npmCombo = (comboNameList, padLog = DEFAULT_PAD_LOG) => {
  if ([ 'help', 'h', 'list', 'ls', 'l' ].includes(comboNameList[ 0 ])) return console.log(`  - ${Object.keys(NPM_COMBO_COMMAND_LIST_MAP).join(', ')}`)

  for (const comboName of comboNameList) {
    const commandList = NPM_COMBO_COMMAND_LIST_MAP[ comboName ]
    if (!commandList) throw new Error(`[combo] invalid comboName: ${comboName}`)
    padLog(0, `[combo] ${comboName}`)
    for (const [ command, message ] of commandList) {
      padLog(1, `$ ${command}   # ${message}`)
      const output = String(execSync(command)).trimEnd()
      output && padLog(0, indentLine(output, '    '))
    }
  }
}

const npxLazy = ([ packageAndVersion, ...extraArgs ], padLog = DEFAULT_PAD_LOG) => {
  const pathGlobalNodeModules = getPathGlobalNodeModules()
  const tryRequireGlobal = getTryRequireGlobal(pathGlobalNodeModules)

  let npxCommand = packageAndVersion

  const [ packageName, version ] = packageAndVersion.split('@')
  if (!version) padLog(1, `bail, no package version: ${packageAndVersion}`)
  else {
    const semver = tryRequireGlobal('npm', 'node_modules', 'semver') // borrow package from npm
    const testPackageVersion = (...prePathList) => {
      try { // try cwd first, may be run from npm script
        const packagePath = resolve(...prePathList, packageName, 'package.json')
        padLog(1, `try package: ${packagePath}`)

        const packageJSON = tryRequire(packagePath)
        if (semver.satisfies(packageJSON.version, version)) {
          padLog(2, `can run package directly, version fit: ${packageJSON.version} - ${packageAndVersion}`)
          return packageName
        } else {
          padLog(2, `bail, package version mismatch: ${packageJSON.version} - ${packageAndVersion}`)
          return packageAndVersion
        }
      } catch (error) { padLog(2, `failed to get package version: ${packageAndVersion}`, error) }
    }

    npxCommand = testPackageVersion(process.cwd(), 'node_modules') || // cwd first, may be run from npm script
      testPackageVersion(PATH_NODE_MODULES) || // local?
      testPackageVersion(pathGlobalNodeModules) || // global
      packageAndVersion // fallback
  }

  const npx = tryRequireGlobal('npm', 'node_modules', 'libnpx') // borrow package from npm
  const pathNpm = resolve(pathGlobalNodeModules, 'npm', 'bin', 'npm-cli.js') // optional, something like `path.join(__dirname, 'node_modules', 'npm', 'bin', 'npm-cli.js')`

  padLog(1, `npxCommand:`, npxCommand)
  padLog(1, `pathNpm:`, pathNpm)

  return npx(npx.parseArgs([
    process.argv[ 0 ], // node
    process.argv[ 1 ], // this script
    npxCommand,
    ...extraArgs
  ], pathNpm))
}

export {
  PATH_NODE_MODULES,
  getPathNpmNodeModules,
  getPathGlobalNodeModules,
  getTryRequireGlobal,
  npmCombo,
  npxLazy
}
