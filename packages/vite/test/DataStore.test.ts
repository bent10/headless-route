/// <reference types="vitest/globals" />

import type { MockInstance } from 'vitest'
import { DataStore } from '../src/DataStore.js'

describe('DataStore', () => {
  let dataStore: DataStore
  let consoleSpy: MockInstance
  let loggedMessage: undefined | string

  beforeEach(() => {
    dataStore = new DataStore()
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

  it('should initialize with default configuration options', () => {
    expect(dataStore.config).toEqual({
      dir: 'data',
      extensions: ['.json', '.yml', '.yaml', '.js', '.mjs', '.cjs'],
      localDataDir: '',
      localDataSuffix: '.data',
      merge: true,
      ignore: []
    })
  })

  it('should set and get a key-value pair', () => {
    dataStore.set('key', 'value')

    expect(dataStore.get('key')).toBe('value')
    expect(
      loggedMessage?.endsWith('\u001b[33msets\u001b[0m \u001b[2mkey\u001b[0m')
    ).toBeTruthy()
  })

  it('should delete a key-value pair', () => {
    dataStore.set('key', 'value')
    expect(
      loggedMessage?.endsWith('\u001b[33msets\u001b[0m \u001b[2mkey\u001b[0m')
    ).toBeTruthy()

    dataStore.delete('key')
    expect(
      loggedMessage?.endsWith(
        '\u001b[31mdeletes\u001b[0m \u001b[2mkey\u001b[0m'
      )
    ).toBeTruthy()

    expect(dataStore.get('key')).toBeUndefined()
  })

  it('should merge global data sources into a single object', () => {
    dataStore.set('data/page1.json', { title: 'Page 1' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mdata/page1.json\u001b[0m'
      )
    ).toBeTruthy()

    dataStore.set('data/page2.json', { title: 'Page 2' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mdata/page2.json\u001b[0m'
      )
    ).toBeTruthy()

    const mergedData = dataStore.join()

    expect(mergedData).toEqual({
      page1: { title: 'Page 1' },
      page2: { title: 'Page 2' }
    })
  })

  it('should retrieve data for a specific route URL', () => {
    dataStore.config.localDataDir = 'pages'

    dataStore.set('pages/pages.data.json', { product: 'Product 1' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mpages/pages.data.json\u001b[0m'
      )
    ).toBeTruthy()

    dataStore.set('pages/products/index.data.json', { index: 'Products Index' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mpages/products/index.data.json\u001b[0m'
      )
    ).toBeTruthy()

    const routeData = dataStore.getRouteData('/products/index.html', '.html')

    expect(routeData).toEqual({
      product: 'Product 1',
      index: 'Products Index'
    })
  })

  it('should retrieve data for a specific route URL without suffix', () => {
    dataStore.config.localDataDir = 'pages'

    dataStore.set('pages/pages.data.json', { product: 'Product 1' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mpages/pages.data.json\u001b[0m'
      )
    ).toBeTruthy()

    dataStore.set('pages/products/index.data.json', { index: 'Products Index' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mpages/products/index.data.json\u001b[0m'
      )
    ).toBeTruthy()

    const routeData = dataStore.getRouteData('/products/index')

    expect(routeData).toEqual({
      product: 'Product 1',
      index: 'Products Index'
    })
  })

  it('should dump configuration and data sources as a JSON string', () => {
    dataStore.set('data/page1.json', { title: 'Page 1' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mdata/page1.json\u001b[0m'
      )
    ).toBeTruthy()

    dataStore.set('data/page2.json', { title: 'Page 2' })
    expect(
      loggedMessage?.endsWith(
        '\u001b[33msets\u001b[0m \u001b[2mdata/page2.json\u001b[0m'
      )
    ).toBeTruthy()

    const dumpedData = dataStore.dump()

    expect(dumpedData).toContain('"config":')
    expect(dumpedData).toContain('"source":')
    expect(dumpedData).toContain('"datasources":')
    expect(dumpedData).toContain('"entries":')
  })
})
