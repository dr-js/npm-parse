import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'
import { getScriptFileListFromPathList } from 'dev-dep-tool/library/fileList'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from 'dev-dep-tool/library/commonOutput'
import { wrapFileProcessor, fileProcessorBabel, fileProcessorWebpack } from 'dev-dep-tool/library/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dev-dep-tool/library/minify'

import { binary as formatBinary } from 'dr-js/module/common/format'
import { modify } from 'dr-js/module/node/file/Modify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const buildOutput = async ({ logger: { padLog } }) => {
  padLog('generate export info')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  padLog(`build bin`)
  execSync('npm run build-bin', execOptionRoot)

  padLog(`delete temp build file`)
  execSync('npm run script-delete-temp-build-file', execOptionRoot)
}

const processOutput = async ({ packageJSON, logger }) => {
  const { padLog, log } = logger

  const fileListLibrary = await getScriptFileListFromPathList([ 'library' ], fromOutput)
  const fileListBin = await getScriptFileListFromPathList([ 'bin' ], fromOutput)

  padLog(`minify output`)
  let sizeCodeReduceModule = await minifyFileListWithTerser({ fileList: [ ...fileListLibrary, ...fileListBin ], option: getTerserOption(), rootPath: PATH_OUTPUT, logger })

  log(`process output`)
  const processBabel = wrapFileProcessor({ processor: fileProcessorBabel, logger })
  const processWebpack = wrapFileProcessor({ processor: fileProcessorWebpack, logger })
  for (const filePath of fileListLibrary) sizeCodeReduceModule += await processBabel(filePath)
  for (const filePath of fileListBin) sizeCodeReduceModule += await processWebpack(filePath)
  log(`output size reduce: ${formatBinary(sizeCodeReduceModule)}B`)
}

const testCode = async ({ padLog }) => {
  padLog(`test source`)
  execSync(`npm run test-mocha-source`, execOptionRoot)

  padLog(`test output`)
  execSync(`npm run test-bin`, execOptionRoot)
}

const clearOutput = async ({ packageJSON, logger: { padLog, log } }) => {
  padLog(`clear output`)

  log(`clear test`)
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput, (path) => path.endsWith('.test.js'))
  for (const filePath of fileList) await modify.delete(filePath)
}

runMain(async (logger) => {
  const isTest = argvFlag('test', 'publish', 'publish-dev')
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ packageJSON, logger })
  isTest && await testCode(logger)

  await clearOutput({ packageJSON, logger })
  await verifyOutputBinVersion({ packageJSON, fromOutput, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  isTest && execSync(`npm run test-bin -- npx`, execOptionRoot)

  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
