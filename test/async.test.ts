/// <reference types="vitest/globals" />

import { createNavigation, createRoutes } from '../src/index.js'
import { loadDatafiles } from './utils.js'

describe.skip('createRoutes', () => {
  it('scans directory for routes with default options', async () => {
    const routes = await createRoutes({ dir: process.cwd() })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom directory', async () => {
    const routes = await createRoutes({ dir: 'example' })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom extensions', async () => {
    const routes = await createRoutes({ dir: 'src', extensions: ['.ts'] })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with custom urlSuffix', async () => {
    const routes = await createRoutes({ urlSuffix: '.html' })

    expect(routes).toMatchSnapshot()
  })

  it('scans directory for routes with enabled cache', async () => {
    const routes = await createRoutes({ cache: true })

    await createRoutes({ cache: true })

    expect(routes).toMatchSnapshot()
  })

  it('applies filter function to exclude certain files', async () => {
    const routes = await createRoutes({
      dir: 'example',
      urlSuffix: '.html',
      filter(file) {
        return !file.name.startsWith('_')
      }
    })

    expect(routes).toMatchSnapshot()
  })

  it('applies handler function to modify routes', async () => {
    const routes = await createRoutes({
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

describe.skip('createNavigation', () => {
  it('creates navigation routes from provided routes', async () => {
    const routes = await createRoutes()
    const navigationRoutes = createNavigation(routes)

    expect(navigationRoutes).toMatchSnapshot()
  })

  it('creates navigation routes with route handler', async () => {
    const routes = await createRoutes({
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

  it('creates navigation routes with navigation handler', async () => {
    const routes = await createRoutes({
      dir: 'example',
      urlSuffix: '.html',
      extensions: ['.md', '.html'],
      filter(file) {
        // ignore files starting with '_'
        return !file.name.startsWith('_')
      }
    })
    const navigationRoutes = createNavigation(routes, route => {
      const segments = route.stem.split('/')
      const lastSegment = String(segments.pop())

      Object.assign(route, {
        text: lastSegment[0].toUpperCase() + lastSegment.slice(1).toLowerCase()
      })
    })

    expect(navigationRoutes).toMatchSnapshot()
  })
})
