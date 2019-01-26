import { readFileSync } from 'fs'
import { run } from 'dr-js/module/node/system/Run'

import { wrapJoinBashArgs, warpBashSubShell, parsePackageScript } from 'source'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, { get, tryGet }) => {
  const packageJSON = JSON.parse(readFileSync('package.json')) // TODO: NOTE: relative to cwd
  const devLog = tryGet('debug')
    ? (tab, ...args) => console.log(`${'  '.repeat(tab)}${args.join(' ')}`)
    : () => {}
  let command
  if (modeName.endsWith('-list')) {
    const scriptNameList = get(modeName)
    command = warpBashSubShell(scriptNameList
      .map((scriptName) => parsePackageScript(packageJSON, scriptName, '', 0, devLog))
      .join('\n')
    )
  } else {
    const [ scriptName, ...extraArgs ] = get(modeName)
    command = parsePackageScript(packageJSON, scriptName, wrapJoinBashArgs(extraArgs), 0, devLog)
  }
  if (modeName.startsWith('parse-script')) return console.log(command)
  if (modeName.startsWith('run-script')) return run({ command: 'bash', argList: [ '-c', command ], option: { stdio: 'inherit', shell: false } }).promise
}

const main = async () => {
  const optionData = await parseOption()
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))

  if (!modeName) {
    return optionData.tryGet('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.tryGet('help') ? null : 'simple'))
  }

  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
