import { readFileSync } from 'fs'
import { MODE_FORMAT_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

import { stringIndentLine } from 'dr-js/module/common/format'

const REGEXP_ESCAPE = /\\/g
const REGEXP_QUOTE = /[" ]/g
const wrapJoinBashArgs = (args) => args.map((arg) => `"${arg.replace(REGEXP_ESCAPE, '\\\\').replace(REGEXP_QUOTE, '\\$&')}"`).join(' ')

const warpBashSubShell = (command) => `(
${stringIndentLine(command, '  ')}
)`

const parseCommand = (packageJSON, scriptString, level, devLog) => {
  devLog(level, '[parseCommand]', `input: <${scriptString}>`)

  if (scriptString.includes(' && ')) { // combo command, split
    devLog(level, '- combo command, split')

    const subCommandList = scriptString.split(/\s+&&\s+/)
    return warpBashSubShell(subCommandList.map((command) => parseCommand(packageJSON, command, level + 1, devLog) || command).join('\n'))
  }

  const [ scriptLeadingCommand, scriptSecondCommand, ...scriptExtraCommandList ] = scriptString.trim().split(' ')
  if ([
    'node', 'npx',
    'rm', 'mkdir',
    'cd',
    'echo', 'exit', 'kill'
  ].includes(scriptLeadingCommand)) { // directly executable, return
    devLog(level, '- directly executable, return')

    return scriptString
  }

  if (
    scriptSecondCommand === 'run' &&
    [ 'npm', 'yarn' ].includes(scriptLeadingCommand)
  ) { // package script, parse
    devLog(level, '- package script, parse')

    const [ scriptName, ...extraArgs ] = scriptExtraCommandList
    extraArgs[ 0 ] === '--' && extraArgs.shift()
    return parsePackageScript(packageJSON, scriptName, extraArgs.join(' '), level + 1, devLog)
  }

  devLog(level, '- unknown script, bail')
  return ''
}

const parsePackageScript = (packageJSON, scriptName, extraArgsString = '', level, devLog) => {
  devLog(level, '[parsePackageScript]', `script name: <${scriptName}>, extra: ${extraArgsString}`)

  const scriptString = packageJSON[ 'scripts' ][ scriptName ]
  if (!scriptString) throw new Error(`[parsePackageScript] missing script with name: ${scriptName}`)

  const resultCommand = parseCommand(packageJSON, [ scriptString, extraArgsString ].filter(Boolean).join(' '), level + 1, devLog)
  if (resultCommand) return resultCommand

  devLog(level, '- unexpected script, bail to npm')
  return [
    `npm --no-update-notifier run "${scriptName}"`,
    extraArgsString
  ].filter(Boolean).join(' -- ')
}

const runMode = async (modeName, { getOptionOptional, getSingleOption, getSingleOptionOptional }) => {
  const argumentList = getOptionOptional(modeName) || []
  const devLog = getOptionOptional('debug')
    ? (tab, ...args) => console.log(`${'  '.repeat(tab)}${args.join(' ')}`)
    : () => {}

  switch (modeName) {
    case 'parse-script': {
      const [ scriptName, ...extraArgs ] = argumentList
      const packageJSON = JSON.parse(readFileSync('package.json'))
      return console.log(parsePackageScript(packageJSON, scriptName, wrapJoinBashArgs(extraArgs), 0, devLog))
    }
  }
}

const main = async () => {
  const optionData = await parseOption()
  const { name: modeName } = MODE_FORMAT_LIST.find(({ name }) => optionData.getOptionOptional(name)) || {}

  if (!modeName) {
    return optionData.getOptionOptional('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.getOptionOptional('help') ? null : 'simple'))
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
