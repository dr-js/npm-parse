import { resolve, sep } from 'path'
import { execSync } from 'child_process'
import { writeFileSync, existsSync } from 'fs'

import { stringIndentLine } from 'dr-js/module/common/format'

import { runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'
import { collectSourceRouteMap } from 'dev-dep-tool/library/ExportIndex/parseExport'
import { generateIndexScript, generateExportInfo } from 'dev-dep-tool/library/ExportIndex/generateInfo'
import { autoAppendMarkdownHeaderLink, renderMarkdownFileLink, renderMarkdownExportPath, renderMarkdownExportTree } from 'dev-dep-tool/library/ExportIndex/renderMarkdown'

import { formatUsage } from 'source-bin/option'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownBinOptionFormat = () => [
  renderMarkdownFileLink('source/option.js'),
  '> ```',
  stringIndentLine(formatUsage(), '> '),
  '> ```'
]

const generateTempFile = ({ sourceRouteMap, logger }) => {
  const tempFileList = []
  const writeTempFile = (path, data) => {
    logger.devLog(`[tempFile] ${path}`)
    writeFileSync(path, data)
    tempFileList.push(path)
  }

  const indexScriptMap = generateIndexScript({ sourceRouteMap })
  Object.entries(indexScriptMap).forEach(([ path, data ]) => writeTempFile(path, data))

  writeFileSync(fromRoot('tempFileDelete.config.json'), JSON.stringify({
    drJsFileModifyDelete: [ ...tempFileList, 'tempFileDelete.config.json' ],
    drJsQuiet: true
  }))
}

runMain(async (logger) => {
  if (existsSync(fromRoot('tempFileDelete.config.json'))) {
    logger.padLog(`[clear] delete previous temp build file`)
    execSync('npm run script-delete-temp-build-file', { cwd: fromRoot(), stdio: 'ignore', shell: true })
  }

  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ pathRootList: [ fromRoot('source') ], logger })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  const initRouteList = fromRoot('source').split(sep)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...autoAppendMarkdownHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      '',
      '#### Export Tree',
      ...renderMarkdownExportTree({ exportInfo: exportInfoMap[ initRouteList.join('/') ], routeList: initRouteList }),
      '',
      '#### Bin Option Format',
      ...renderMarkdownBinOptionFormat()
    ),
    ''
  ].join('\n'))

  logger.log(`output: tempFileDelete.config.json`)
  generateTempFile({ sourceRouteMap, logger })
}, getLogger('generate-export'))
