import { readFileSync } from 'fs'
import { run } from '@dr-js/core/module/node/system/Run'

import {
  wrapJoinBashArgs, warpBashSubShell, parsePackageScript,
  npmCombo, npxLazy
} from 'source'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, { get, tryGet }) => {
  const padLog = tryGet('debug')
    ? (level, ...args) => console.log(`${'  '.repeat(level)}${args.join(' ')}`)
    : () => {}

  if (modeName === 'npm-combo') return npmCombo(get(modeName), padLog)
  if (modeName === 'npx-lazy') return npxLazy(get(modeName), padLog)

  const packageJSON = JSON.parse(String(readFileSync('package.json'))) // TODO: NOTE: relative to cwd
  let command
  if (modeName.endsWith('-list')) {
    const scriptNameList = get(modeName)
    command = warpBashSubShell(scriptNameList
      .map((scriptName) => parsePackageScript(packageJSON, scriptName, '', 0, padLog))
      .join('\n')
    )
  } else {
    const [ scriptName, ...extraArgs ] = get(modeName)
    command = parsePackageScript(packageJSON, scriptName, wrapJoinBashArgs(extraArgs), 0, padLog)
  }
  if (modeName.startsWith('parse-script')) return console.log(command)
  if (modeName.startsWith('run-script')) return run({ command: 'bash', argList: [ '-c', command ] }).promise
}

const logJSON = (value) => console.log(JSON.stringify(value, null, 2))

const main = async () => {
  const optionData = await parseOption()
  if (optionData.tryGet('version')) return logJSON({ packageName, packageVersion })
  if (optionData.tryGet('help')) return logJSON(formatUsage())
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))
  if (!modeName) throw new Error('no mode specified')
  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
