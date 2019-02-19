import { indentLine } from 'dr-js/module/common/string'

const DEFAULT_PAD_LOG = __DEV__
  ? (padLevel, ...args) => console.log(`${'  '.repeat(padLevel)}${args.join(' ')}`)
  : () => {}

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

const parseCommand = (packageJSON, scriptString, level, padLog = DEFAULT_PAD_LOG) => {
  padLog(level, '[parseCommand]', `input: <${scriptString}>`)
  scriptString = scriptString.trim()

  const [ scriptLeadingCommand, scriptSecondCommand, ...scriptExtraCommandList ] = scriptString.split(' ')
  if (
    COMPLEX_BASH_COMMAND_LIST.includes(scriptLeadingCommand) ||
    scriptLeadingCommand.startsWith('./')
  ) {
    padLog(level, '- directly executable complex command, return')
    return scriptString
  } else padLog(level, `? not directly executable complex command: ${scriptLeadingCommand}`)

  if (scriptString.includes(' && ')) {
    padLog(level, '- combo command, split')

    const subCommandList = scriptString.split(' && ')
    return warpBashSubShell(subCommandList.map((command) => parseCommand(packageJSON, command, level + 1, padLog) || command).join('\n'))
  } else padLog(level, `? not combo command, I guess`)

  if (SIMPLE_BASH_COMMAND_LIST.includes(scriptLeadingCommand)) {
    padLog(level, '- directly executable simple command, return')

    return scriptString
  } else padLog(level, `? not directly executable simple command: ${scriptLeadingCommand}`)

  // TODO: consider allow package dependency command
  // TODO: consider allow package dependency command
  // TODO: consider allow package dependency command

  if (
    scriptSecondCommand === 'run' &&
    [ 'npm', 'yarn' ].includes(scriptLeadingCommand)
  ) {
    padLog(level, '- package script, parse')

    const [ scriptName, ...extraArgs ] = scriptExtraCommandList
    extraArgs[ 0 ] === '--' && extraArgs.shift()
    return parsePackageScript(packageJSON, scriptName, extraArgs.join(' '), level + 1, padLog)
  } else padLog(level, '? unknown npm/yarn script')

  padLog(level, '? unknown script, bail')
  return ''
}

const parsePackageScript = (packageJSON, scriptName, extraArgsString = '', level, padLog = DEFAULT_PAD_LOG) => {
  padLog(level, '[parsePackageScript]', `script name: <${scriptName}>, extra: ${extraArgsString}`)

  const scriptString = packageJSON[ 'scripts' ][ scriptName ]
  if (!scriptString) throw new Error(`[parsePackageScript] missing script with name: ${scriptName}`)

  const resultCommand = parseCommand(packageJSON, [ scriptString, extraArgsString ].filter(Boolean).join(' '), level + 1, padLog)
  if (resultCommand) return resultCommand

  padLog(level, '? unexpected script, bail to npm run')
  return [ `npm run "${scriptName}"`, extraArgsString ].filter(Boolean).join(' -- ')
}

export {
  wrapJoinBashArgs,
  warpBashSubShell,
  parseCommand,
  parsePackageScript
}
