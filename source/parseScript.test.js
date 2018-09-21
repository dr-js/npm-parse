import { strictEqual } from 'assert'
import { readFileSync } from 'fs'
import {
  wrapJoinBashArgs,
  warpBashSubShell,
  parseCommand,
  parsePackageScript
} from './parseScript'

const { describe, it } = global

const devLog = () => {}
const packageJSON = JSON.parse(readFileSync('package.json'))

describe('parseScript', () => {
  it('wrapJoinBashArgs()', () => {
    strictEqual(wrapJoinBashArgs([]), '')
    strictEqual(wrapJoinBashArgs([ '.', '1', 'A' ]), '"." "1" "A"')
    strictEqual(wrapJoinBashArgs([ '"', `'`, '\\', '\\"' ]), '"\\"" "\'" "\\\\" "\\\\\\""')
  })

  it('warpBashSubShell()', () => {
    strictEqual(warpBashSubShell('123'), `(\n  123\n)`)
  })

  it('parseCommand()', () => {
    const part0 = `should return '' for unknown command`
    strictEqual(parseCommand(packageJSON, '', 0, devLog), '', part0)
    strictEqual(parseCommand(packageJSON, '123', 0, devLog), '', part0)
    strictEqual(parseCommand(packageJSON, 'a b c', 0, devLog), '', part0)
    strictEqual(parseCommand(packageJSON, 'npm outdated', 0, devLog), '', part0)
    strictEqual(parseCommand(packageJSON, 'yarn outdated', 0, devLog), '', part0)

    const part1 = `should return/unwrap for directly executable command`
    const part1CommandList = [
      'echo 123',
      'cd ./source',
      'node ./bin/index.js',
      'rm -rf /*',
      'kill 3000',
      './test/test.sh'
    ]
    part1CommandList.forEach((command) => strictEqual(parseCommand(packageJSON, command, 0, devLog), command, part1))

    const part2 = `should parse 'npm/yarn run' command`
    strictEqual(parseCommand(packageJSON, 'npm run test', 0, devLog), 'npm --no-update-notifier run "script-pack-test"', part2)
    strictEqual(parseCommand(packageJSON, 'yarn run test', 0, devLog), 'npm --no-update-notifier run "script-pack-test"', part2)

    const part3 = `should parse combo command`
    strictEqual(parseCommand(packageJSON, 'npm run test && yarn run test && npm run prepack', 0, devLog), [
      '(',
      '  npm --no-update-notifier run "script-pack-test"',
      '  npm --no-update-notifier run "script-pack-test"',
      '  (',
      '    echo "Error: pack with script-*"',
      '    exit 1',
      '  )',
      ')'
    ].join('\n'), part3)
  })

  it('parsePackageScript()', () => {
    strictEqual(parsePackageScript(packageJSON, 'test', '', 0, devLog), 'npm --no-update-notifier run "script-pack-test"')
    strictEqual(parsePackageScript(packageJSON, 'test', '"1" "2" "\\""', 0, devLog), 'npm --no-update-notifier run "script-pack-test" -- "1" "2" "\\""')

    strictEqual(parsePackageScript(packageJSON, 'prepack', '', 0, devLog), [
      '(',
      '  echo "Error: pack with script-*"',
      '  exit 1',
      ')'
    ].join('\n'))
    strictEqual(parsePackageScript(packageJSON, 'prepack', '"1" "2" "\\""', 0, devLog), [
      '(',
      '  echo "Error: pack with script-*"',
      '  exit 1 "1" "2" "\\""',
      ')'
    ].join('\n'))
  })
})
