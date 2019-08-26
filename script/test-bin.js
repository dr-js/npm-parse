import { resolve } from 'path'
import { execSync } from 'child_process'
import { strictEqual } from '@dr-js/core/module/common/verify'

import { runMain, argvFlag } from '@dr-js/dev/module/main'

import { name as packageName, version as packageVersion } from '../package.json'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const testOutput = (command, expectOutput) => strictEqual(
  execSync(command, { ...execOptionRoot, stdio: 'pipe' }).toString().trim(),
  expectOutput
)

runMain(async ({ padLog, log }) => {
  const command = argvFlag('npx')
    ? `npx ${packageName}-${packageVersion}.tgz`
    : 'node ./output-gitignore/bin'

  padLog(`test output (command: ${command})`)

  log('parse-script: "test"')
  testOutput(
    `${command} -s test`,
    `node -r @babel/register ./script verbose pack test`
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
    `  node -r @babel/register ./script verbose pack test`,
    `  (`,
    `    echo "Error: pack with script-*"`,
    `    exit 1`,
    `  )`,
    `)`
  ].join('\n'))
})
