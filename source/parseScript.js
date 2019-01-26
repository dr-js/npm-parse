import { indentLine } from 'dr-js/module/common/string'

const COMPLEX_BASH_COMMAND_LIST = [ // complex command, do not parse further
  'bash', 'sh', 'ssh', '.', 'source',
  'su', 'sudo',
  'cd', // TODO: try parse simple cd, to unwrap further
  'if',
  'eval'
]

const SIMPLE_BASH_COMMAND_LIST = [
  'node', 'npx', 'git',
  'rm', 'mkdir',
  'echo', 'cat',
  'exit', 'kill'
]

const REGEXP_ESCAPE = /\\/g
const REGEXP_QUOTE = /[" ]/g
const wrapJoinBashArgs = (args) => args.map((arg) => `"${arg.replace(REGEXP_ESCAPE, '\\\\').replace(REGEXP_QUOTE, '\\$&')}"`).join(' ')

const warpBashSubShell = (command) => `(
${indentLine(command, '  ')}
)`

const parseCommand = (packageJSON, scriptString, level, devLog) => {
  devLog(level, '[parseCommand]', `input: <${scriptString}>`)
  scriptString = scriptString.trim()

  const [ scriptLeadingCommand, scriptSecondCommand, ...scriptExtraCommandList ] = scriptString.split(' ')
  if (
    COMPLEX_BASH_COMMAND_LIST.includes(scriptLeadingCommand) ||
    scriptLeadingCommand.startsWith('./')
  ) {
    devLog(level, '- directly executable complex command, return')
    return scriptString
  } else devLog(level, `? not directly executable complex command: ${scriptLeadingCommand}`)

  if (scriptString.includes(' && ')) {
    devLog(level, '- combo command, split')

    const subCommandList = scriptString.split(' && ')
    return warpBashSubShell(subCommandList.map((command) => parseCommand(packageJSON, command, level + 1, devLog) || command).join('\n'))
  } else devLog(level, `? not combo command, I guess`)

  if (SIMPLE_BASH_COMMAND_LIST.includes(scriptLeadingCommand)) {
    devLog(level, '- directly executable simple command, return')

    return scriptString
  } else devLog(level, `? not directly executable simple command: ${scriptLeadingCommand}`)

  if (
    scriptSecondCommand === 'run' &&
    [ 'npm', 'yarn' ].includes(scriptLeadingCommand)
  ) {
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
