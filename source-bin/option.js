import { ConfigPresetNode, prepareOption } from 'dr-js/module/node/module/Option'

const { BooleanFlag, Config } = ConfigPresetNode

const parseFormat = (modeFormat) => {
  const [ name, alterName = '', argumentCount, isPath ] = modeFormat.split('|').map((v) => v || undefined)
  return {
    optional: true,
    name,
    shortName: alterName.length === 1 ? alterName : undefined,
    aliasNameList: alterName ? [ alterName ] : [],
    argumentCount: argumentCount || 0,
    isPath: Boolean(isPath)
  }
}

const MODE_FORMAT_LIST = [
  'parse-script|s|1-',
  'run-script|r|1-'
].map(parseFormat)

const OPTION_CONFIG = {
  prefixENV: 'npm-parse',
  formatList: [
    Config,
    { ...BooleanFlag, name: 'help', shortName: 'h' },
    { ...BooleanFlag, name: 'version', shortName: 'v' },
    { ...BooleanFlag, name: 'debug', shortName: 'D', description: `more debug log` },
    ...MODE_FORMAT_LIST
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_FORMAT_LIST, parseOption, formatUsage }
