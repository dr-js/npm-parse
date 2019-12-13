import { resolve } from 'path'
import { readFileSync } from 'fs'
import { strictEqual } from '@dr-js/core/module/common/verify'

import {
  wrapJoinBashArgs,
  warpBashSubShell,
  parseCommand,
  parsePackageScript
} from './parseScript'

const { describe, it, info = console.log } = global

const tagLog = (padLevel, ...args) => info(`${'  '.repeat(padLevel)}${args.join(' ')}`)

const packageJSON = JSON.parse(String(readFileSync(resolve(__dirname, '../package.json'))))

describe('parseScript', () => {
  it('wrapJoinBashArgs()', () => {
    strictEqual(wrapJoinBashArgs([]), '')
    strictEqual(wrapJoinBashArgs([ '.', '1', 'A' ]), '"." "1" "A"')
    strictEqual(wrapJoinBashArgs([ '"', '\'', '\\', '\\"' ]), '"\\"" "\'" "\\\\" "\\\\\\""')
  })

  it('warpBashSubShell()', () => {
    strictEqual(warpBashSubShell('123'), '(\n  123\n)')
  })

  it('parseCommand()', () => {
    const part0 = 'should return \'\' for unknown command'
    strictEqual(parseCommand(packageJSON, '', 0, tagLog), '', part0)
    strictEqual(parseCommand(packageJSON, '123', 0, tagLog), '', part0)
    strictEqual(parseCommand(packageJSON, 'a b c', 0, tagLog), '', part0)
    strictEqual(parseCommand(packageJSON, 'npm outdated', 0, tagLog), '', part0)
    strictEqual(parseCommand(packageJSON, 'yarn outdated', 0, tagLog), '', part0)

    const part1 = 'should return/unwrap for directly executable command'
    const part1CommandList = [
      'cd ./source',
      'cd ./source && abc',
      './test/test.sh',
      './test/test.sh && abc',
      'echo 123',
      'node ./bin/index.js',
      'rm -rf /*',
      'kill 3000',
      'env AAA="BBB" node -p process.env.AAA',
      'AAA="BBB" node -p process.env.AAA'
    ]
    part1CommandList.forEach((command) => strictEqual(parseCommand(packageJSON, command, 0, tagLog), command, part1))

    const part2 = 'should parse \'npm/yarn run\' command'
    strictEqual(parseCommand(packageJSON, 'npm run test', 0, tagLog), 'node -r @babel/register ./script verbose pack test', part2)
    strictEqual(parseCommand(packageJSON, 'yarn run test', 0, tagLog), 'node -r @babel/register ./script verbose pack test', part2)

    const part3 = 'should parse combo command'
    strictEqual(parseCommand(packageJSON, 'npm run test && yarn run test && npm run prepack', 0, tagLog), [
      '(',
      '  node -r @babel/register ./script verbose pack test',
      '  node -r @babel/register ./script verbose pack test',
      '  (',
      '    echo "Error: pack with script-*"',
      '    exit 1',
      '  )',
      ')'
    ].join('\n'), part3)
  })

  it('parsePackageScript()', () => {
    strictEqual(parsePackageScript(packageJSON, 'test', '', 0, tagLog), 'node -r @babel/register ./script verbose pack test')
    strictEqual(parsePackageScript(packageJSON, 'test', '"1" "2" "\\""', 0, tagLog), 'node -r @babel/register ./script verbose pack test "1" "2" "\\""')

    strictEqual(parsePackageScript(packageJSON, 'prepack', '', 0, tagLog), [
      '(',
      '  echo "Error: pack with script-*"',
      '  exit 1',
      ')'
    ].join('\n'))
    strictEqual(parsePackageScript(packageJSON, 'prepack', '"1" "2" "\\""', 0, tagLog), [
      '(',
      '  echo "Error: pack with script-*"',
      '  exit 1 "1" "2" "\\""',
      ')'
    ].join('\n'))
  })
})
