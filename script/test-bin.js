import { resolve } from 'path'
import { strictEqual } from 'assert'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog, log } = logger

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
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
