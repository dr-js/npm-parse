import { resolve } from 'path'
import { strictEqual } from 'assert'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'

import { name as packageName, version as packageVersion } from '../package.json'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const testOutput = (command, expectOutput) => strictEqual(
  execSync(command, { ...execOptionRoot, stdio: 'pipe' }).toString().trim(),
  expectOutput
)

runMain(async (logger) => {
  const { padLog, log } = logger

  const command = argvFlag('npx')
    ? `npx ${packageName}-${packageVersion}.tgz`
    : 'node ./output-gitignore/bin'

  padLog(`test output (command: ${command})`)

  log('parse-script: "test"')
  testOutput(
    `${command} -s test`,
    `npm --no-update-notifier run "script-pack-test"`
  )

  log('parse-script: "prepack" with extraArgs')
  testOutput(`${command} -s prepack 1 2 "3"`, [
    `(`,
    `  echo "Error: pack with script-*"`,
    `  exit 1 "1" "2" "3"`,
    `)`
  ].join('\n'))

  log('parse-script-list: "test" and "prepack"')
  testOutput(`${command} --sl test prepack`, [
    `(`,
    `  npm --no-update-notifier run "script-pack-test"`,
    `  (`,
    `    echo "Error: pack with script-*"`,
    `    exit 1`,
    `  )`,
    `)`
  ].join('\n'))

}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
