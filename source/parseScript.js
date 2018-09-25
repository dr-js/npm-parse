import { stringIndentLine } from 'dr-js/module/common/format'

const COMMON_BASH_COMMAND_LIST = [
  'node', 'npx', 'git',
  'bash', 'sh', 'ssh', '.', 'source',
  'su', 'sudo',
  'rm', 'mkdir',
  'if', 'cd', 'eval',
  'exit', 'kill', 'echo', 'cat',
  'dr-js' // why not, global
]

const REGEXP_ESCAPE = /\\/g
const REGEXP_QUOTE = /[" ]/g
const wrapJoinBashArgs = (args) => args.map((arg) => `"${arg.replace(REGEXP_ESCAPE, '\\\\').replace(REGEXP_QUOTE, '\\$&')}"`).join(' ')

const warpBashSubShell = (command) => `(
${stringIndentLine(command, '  ')}
)`

const parseCommand = (packageJSON, scriptString, level, devLog) => {
  devLog(level, '[parseCommand]', `input: <${scriptString}>`)

  if (
    scriptString.includes(' && ')
  ) { // combo command, split
    devLog(level, '- combo command, split')

    const subCommandList = scriptString.split(' && ')
    return warpBashSubShell(subCommandList.map((command) => parseCommand(packageJSON, command, level + 1, devLog) || command).join('\n'))
  } else devLog(level, `? not combo command, I guess`)

  const [ scriptLeadingCommand, scriptSecondCommand, ...scriptExtraCommandList ] = scriptString.trim().split(' ')
  if (
    COMMON_BASH_COMMAND_LIST.includes(scriptLeadingCommand) ||
    scriptLeadingCommand.startsWith('./')
  ) { // directly executable, return
    devLog(level, '- directly executable, return')

    return scriptString
  } else devLog(level, `? not common directly executable: ${scriptLeadingCommand}`)

  if (
    scriptSecondCommand === 'run' &&
    [ 'npm', 'yarn' ].includes(scriptLeadingCommand)
  ) { // package script, parse
    devLog(level, '- package script, parse')

    const [ scriptName, ...extraArgs ] = scriptExtraCommandList
    extraArgs[ 0 ] === '--' && extraArgs.shift()
    return parsePackageScript(packageJSON, scriptName, extraArgs.join(' '), level + 1, devLog)
  } else devLog(level, '? unknown npm/yarn script')

  devLog(level, '? unknown script, bail')
  return ''
}

const parsePackageScript = (packageJSON, scriptName, extraArgsString = '', level, devLog) => {
  devLog(level, '[parsePackageScript]', `script name: <${scriptName}>, extra: ${extraArgsString}`)

  const scriptString = packageJSON[ 'scripts' ][ scriptName ]
  if (!scriptString) throw new Error(`[parsePackageScript] missing script with name: ${scriptName}`)

  const resultCommand = parseCommand(packageJSON, [ scriptString, extraArgsString ].filter(Boolean).join(' '), level + 1, devLog)
  if (resultCommand) return resultCommand

  devLog(level, '? unexpected script, bail to npm run')
  return [ `npm --no-update-notifier run "${scriptName}"`, extraArgsString ].filter(Boolean).join(' -- ')
}

export {
  wrapJoinBashArgs,
  warpBashSubShell,
  parseCommand,
  parsePackageScript
}
