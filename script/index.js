import { resolve } from 'path'
import { execSync } from 'child_process'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/file'
import { runMain, argvFlag } from 'dr-dev/module/main'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from 'dr-dev/module/output'
import { processFileList, fileProcessorBabel, fileProcessorWebpack } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

import { binary } from 'dr-js/module/common/format'
import { modifyDelete } from 'dr-js/module/node/file/Modify'

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

const processOutput = async ({ logger }) => {
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)

  let sizeReduce = 0

  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorWebpack, rootPath: PATH_OUTPUT, logger })

  // again, for maybe better result
  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorWebpack, rootPath: PATH_OUTPUT, logger })

  logger.padLog(`output size reduce: ${binary(sizeReduce)}B`)
}

const testCode = async ({ logger: { padLog } }) => {
  padLog('lint source')
  execSync(`npm run lint`, execOptionRoot)

  padLog(`test source`)
  execSync(`npm run test-source`, execOptionRoot)

  padLog(`test output`)
  execSync(`npm run test-bin`, execOptionRoot)
}

const clearOutput = async ({ logger: { padLog, log } }) => {
  padLog(`clear output`)

  log(`clear test`)
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput, (path) => path.endsWith('.test.js'))
  for (const filePath of fileList) await modifyDelete(filePath)
}

runMain(async (logger) => {
  const isTest = argvFlag('test', 'publish', 'publish-dev')
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ logger })
  isTest && await testCode({ logger })

  await clearOutput({ logger })
  await verifyOutputBinVersion({ packageJSON, fromOutput, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  isTest && execSync(`npm run test-bin -- npx`, execOptionRoot)

  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
})
