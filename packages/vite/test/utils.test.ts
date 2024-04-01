/// <reference types="vitest/globals" />

import { resolve } from 'node:path'
import type { MockInstance } from 'vitest'
import { toRelativePath, deepFreeze, actionLog } from '../src/utils.js'

describe('toRelativePath', () => {
  it('should convert an absolute path to a relative path', () => {
    const absolutePath = resolve(__dirname, 'bar.js')
    const relativePath = toRelativePath(absolutePath)
    expect(relativePath).toBe('test/bar.js')
  })

  it('should return "." if the path is already relative', () => {
    const relativePath = resolve(__dirname, '../')
    const result = toRelativePath(relativePath)
    expect(result).toBe('.')
  })
})

describe('deepFreeze', () => {
  it('should deeply freeze an object', () => {
    const obj = {
      a: 1,
      b: {
        c: [2, 3, { d: 4 }]
      }
    }

    const frozenObj = deepFreeze(obj)

    // Ensure the object itself is frozen
    expect(Object.isFrozen(frozenObj)).toBe(true)

    // Ensure nested objects and arrays are frozen
    expect(Object.isFrozen(frozenObj.b)).toBe(true)
    expect(Object.isFrozen(frozenObj.b.c)).toBe(true)
    expect(Object.isFrozen(frozenObj.b.c[2])).toBe(true)
  })

  it('should return the same object if already deeply frozen', () => {
    const obj = {
      a: 1,
      b: {
        c: [2, 3, { d: 4 }]
      }
    }

    const frozenObj = deepFreeze(obj)
    const doublyFrozenObj = deepFreeze(frozenObj)

    // Ensure the returned object is the same as the input
    expect(doublyFrozenObj).toBe(frozenObj)
  })
})

describe('actionLog', () => {
  let consoleSpy: MockInstance
  let loggedMessage: undefined | string

  beforeEach(() => {
    // Spy on console.log to capture the log message
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(message => {
      loggedMessage = message
    })
  })

  afterEach(() => {
    // Restore console.log after each test
    consoleSpy.mockRestore()
    // Reset loggedMessage variable
    loggedMessage = undefined
  })

  it('should log a reload action with green color', () => {
    actionLog('page-id', 'reload')
    expect(
      loggedMessage?.endsWith(
        '\u001b[32mreloads\u001b[0m \u001b[2mpage-id\u001b[0m'
      )
    ).toBeTruthy()
  })

  it('should log a set action with yellow color', () => {
    actionLog('page-id', 'set')
    expect(
      loggedMessage?.endsWith('\x1b[33msets\x1b[0m \x1b[2mpage-id\x1b[0m')
    ).toBeTruthy()
  })

  it('should log a delete action with red color', () => {
    actionLog('page-id', 'delete')
    expect(
      loggedMessage?.endsWith('\x1b[31mdeletes\x1b[0m \x1b[2mpage-id\x1b[0m')
    ).toBeTruthy()
  })
})
