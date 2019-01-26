import { Preset, prepareOption } from 'dr-js/module/node/module/Option/preset'

const { Config, parseCompactList } = Preset

const MODE_FORMAT_LIST = parseCompactList(
  'parse-script,s/AS,O|$@=scriptName,...extraArgs',
  'parse-script-list,sl/AS,O|$@=...scriptNameList',
  'run-script,r/AS,O|$@=scriptName,...extraArgs',
  'run-script-list,rl/AS,O|$@=...scriptNameList'
)
const MODE_NAME_LIST = MODE_FORMAT_LIST.map(({ name }) => name)

const OPTION_CONFIG = {
  prefixENV: 'npm-parse',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'debug,D/T|more debug log',
      'version,v/T|show version'
    ),
    ...MODE_FORMAT_LIST
  ]
}
const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
