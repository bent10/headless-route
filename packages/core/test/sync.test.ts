/// <reference types="vitest/globals" />

import { createNavigationSync, createRoutesSync } from '../src/index.js'
import { loadDatafiles } from './utils.js'

describe('createRoutesSync', () => {
  it('scans directory for routes with default options', () => {
    const routes = createRoutesSync()

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom directory', () => {
    const routes = createRoutesSync({ dir: 'example' })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom absolute directory', () => {
    const routes = createRoutesSync({ dir: process.cwd() })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom extensions', () => {
    const routes = createRoutesSync({ dir: 'src', extensions: ['.ts'] })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom urlSuffix', () => {
    const routes = createRoutesSync({ urlSuffix: '.html' })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with enabled cache', () => {
    const routes = createRoutesSync({ cache: true })

    createRoutesSync({ cache: true })

    expect(routes).toMatchSnapshot()
  })

  it('applies filter function to exclude certain files', () => {
    const routes = createRoutesSync({
      dir: 'example',
      urlSuffix: '.html',
      filter(file) {
        return !file.name.startsWith('_')
      }
    })

    expect(routes).toMatchSnapshot()
  })

  it('applies handler function to modify routes', () => {
    const routes = createRoutesSync({
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

  it('throws missing dir', async () => {
    expect(() => createRoutesSync({ dir: 'missing' })).toThrowError()
  })
})

describe('createNavigationSync', () => {
  it('creates navigation routes from provided routes', () => {
    const routes = createRoutesSync()
    const navigationRoutes = createNavigationSync(routes)

    expect(navigationRoutes).toMatchSnapshot()
  })

  it('creates navigation routes with route handler', () => {
    const routes = createRoutesSync({
      dir: 'example',
      urlSuffix: '.html',
      extensions: ['.md', '.html'],
      filter(file) {
        // ignore files starting with '_'
        return !file.name.startsWith('_')
      },
      handler: loadDatafiles
    })
    const navigationRoutes = createNavigationSync(routes)

    expect(navigationRoutes).toMatchSnapshot()
  })

  it('creates navigation routes with navigation handler', () => {
    const routes = createRoutesSync({
      dir: 'example',
      urlSuffix: '.html',
      extensions: ['.md', '.html'],
      filter(file) {
        // ignore files starting with '_'
        return !file.name.startsWith('_')
      }
    })
    const navigationRoutes = createNavigationSync(routes, route => {
      const segments = route.stem.split('/')
      const lastSegment = String(segments.pop())

      Object.assign(route, {
        text: lastSegment[0].toUpperCase() + lastSegment.slice(1).toLowerCase()
      })
    })

    expect(navigationRoutes).toMatchSnapshot()
  })
})
