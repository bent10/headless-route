/// <reference types="vitest/globals" />

import { createNavigation, createRoutes } from '../src/index.js'
import { loadDatafiles } from './utils.js'

it('readme', () => {
  const routes = createRoutes({
    dir: 'example',
    extensions: ['.html', '.md'],
    urlSuffix: '.html',
    filter(file) {
      // ignore files starting with '_'
      return !file.name.startsWith('_') && !file.name.startsWith('foo')
    }
  })

  console.log(JSON.stringify(createNavigation(routes), null, 2))
  // console.log(routes)
})

describe('createRoutes', () => {
  it('scans directory for routes with default options', () => {
    const routes = createRoutes({ dir: process.cwd() })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom directory', () => {
    const routes = createRoutes({ dir: 'example' })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom extensions', () => {
    const routes = createRoutes({ dir: 'src', extensions: ['.ts'] })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom urlSuffix', () => {
    const routes = createRoutes({ urlSuffix: '.html' })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with enabled cache', () => {
    const routes = createRoutes({ cache: true })

    createRoutes({ cache: true })

    expect(routes).toMatchSnapshot()
  })

  it('applies filter function to exclude certain files', () => {
    const routes = createRoutes({
      dir: 'example',
      urlSuffix: '.html',
      filter(file) {
        return !file.name.startsWith('_')
      }
    })

    expect(routes).toMatchSnapshot()
  })

  it('applies handler function to modify routes', () => {
    const routes = createRoutes({
      dir: 'example',
      urlSuffix: '.html',
      extensions: ['.md', '.html'],
      filter(file) {
        // ignore files starting with '_'
        return !file.name.startsWith('_')
      },
      handler: loadDatafiles
    })

    expect(routes).toMatchSnapshot()
  })
})

describe('createNavigation', () => {
  test('creates navigation routes from provided routes', () => {
    const routes = createRoutes()
    const navigationRoutes = createNavigation(routes)

    expect(navigationRoutes).toMatchSnapshot()
  })

  test('creates navigation routes with route handler', () => {
    const routes = createRoutes({
      dir: 'example',
      urlSuffix: '.html',
      extensions: ['.md', '.html'],
      filter(file) {
        // ignore files starting with '_'
        return !file.name.startsWith('_')
      },
      handler: loadDatafiles
    })
    const navigationRoutes = createNavigation(routes)

    expect(navigationRoutes).toMatchSnapshot()
  })
})
