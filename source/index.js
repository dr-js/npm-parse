import { readFileSync } from 'fs'

import { wrapJoinBashArgs, parsePackageScript } from './parseScript'
import { MODE_FORMAT_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, { getOptionOptional }) => {
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
