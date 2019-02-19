import { Preset, prepareOption } from 'dr-js/module/node/module/Option/preset'

const { Config, parseCompactList } = Preset

const MODE_FORMAT_LIST = parseCompactList(
  'parse-script,s/AS,O|parse and echo: $@=scriptName,...extraArgs',
  'parse-script-list,sl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',
  'run-script,r/AS,O|parse and run: $@=scriptName,...extraArgs',
  'run-script-list,rl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',
  'npm-combo,nc/AS,O|useful npm combo',
  'npx-lazy,npx,nl/AS,O|skip npx re-install if package version fit: $@=package@version,...extraArgs'
  // TODO: add combo: npm i && npm ddp && npm i
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
