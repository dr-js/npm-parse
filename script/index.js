import { resolve } from 'path'
import { strictEqual } from 'assert'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'
import { getScriptFileListFromPathList } from 'dev-dep-tool/library/fileList'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from 'dev-dep-tool/library/commonOutput'
import { wrapFileProcessor, fileProcessorWebpack } from 'dev-dep-tool/library/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dev-dep-tool/library/minify'

import { binary as formatBinary } from 'dr-js/module/common/format'
import { modify } from 'dr-js/module/node/file/Modify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const buildOutput = async ({ logger: { padLog } }) => {
  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  padLog('generate export info')
  execSync(`npm run script-generate-spec`, execOptionRoot)
}

const processOutput = async ({ packageJSON, logger }) => {
  const { padLog, log } = logger

  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)

  padLog(`minify output`)
  let sizeCodeReduceModule = await minifyFileListWithTerser({ fileList, option: getTerserOption({}), rootPath: PATH_OUTPUT, logger })

  log(`process output`)
  const processWebpack = wrapFileProcessor({ processor: fileProcessorWebpack, logger })
  for (const filePath of fileList) sizeCodeReduceModule += await processWebpack(filePath)
  log(`output size reduce: ${formatBinary(sizeCodeReduceModule)}B`)
}

const testCode = async ({ padLog, log }) => {
  padLog(`test source`)
  execSync(`npm run test-mocha-source`, execOptionRoot)

  padLog(`test output`)

  log('parse-script: "test"')
  strictEqual(
    execSync(`node ./output-gitignore/bin -s test`, { ...execOptionRoot, stdio: 'pipe' })
      .toString()
      .trim(),
    `npm --no-update-notifier run "script-pack-test"`
  )

  log('parse-script: "prepack" with extraArgs')
  strictEqual(
    execSync(`node ./output-gitignore/bin -s prepack 1 2 "3"`, { ...execOptionRoot, stdio: 'pipe' })
      .toString()
      .trim(),
    [
      `(`,
      `  echo "Error: pack with script-*"`,
      `  exit 1 "1" "2" "3"`,
      `)`
    ].join('\n')
  )
}

const clearOutput = async ({ packageJSON, logger: { padLog, log } }) => {
  padLog(`clear output`)

  log(`clear test`)
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput, (path) => path.endsWith('.test.js'))
  for (const filePath of fileList) await modify.delete(filePath)
}

runMain(async (logger) => {
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  logger.padLog(`copy bin`)
  await modify.copy(fromRoot('source-bin/index.js'), fromOutput('bin/index.js'))
  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ packageJSON, logger })

  argvFlag('test', 'publish', 'publish-dev') && await testCode(logger)

  await clearOutput({ packageJSON, logger })
  await verifyOutputBinVersion({ packageJSON, fromOutput, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
