/// <reference types="vitest/globals" />

import 'headless-route'
import type { MockInstance } from 'vitest'
import { DataStore } from '../src/DataStore.js'
import { Api } from '../src/Api.js'
import type { RouteHandler } from '../src/types.js'

describe('Api', () => {
  let api: Api
  let consoleSpy: MockInstance
  let loggedMessage: undefined | string

  beforeEach(() => {
    api = new Api()
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

  describe('constructor', () => {
    it('should create an instance of Api with default options', () => {
      expect(api).toBeInstanceOf(Api)
      expect(api.routesConfig.dir).toEqual('pages')
      expect(api.routesConfig.extensions).toEqual(['.html', '.md'])
      expect(api.routesConfig.urlSuffix).toEqual('.html')
      expect(api.data).toBeInstanceOf(DataStore)
      expect(api.handler).toEqual({})
    })

    it('should override default options with provided options', () => {
      const handler: RouteHandler = {
        html(content) {
          return content
        }
      }
      const customApi = new Api({
        fallbackRoute: '/custom-404',
        handler,
        dataOptions: { dir: 'data' },
        extensions: ['.htm'],
        urlSuffix: '.htm'
      })

      expect(customApi.routesConfig.dir).toEqual('pages')
      expect(customApi.routesConfig.extensions).toEqual(['.htm'])
      expect(customApi.routesConfig.urlSuffix).toEqual('.htm')
      expect(customApi.data.config.dir).toEqual('data')
      expect(customApi.handler).toEqual(handler)
    })
  })

  describe('init', async () => {
    it('should initialize data and routes', async () => {
      vi.spyOn(api.data, 'init').mockResolvedValue()
      vi.mock('headless-route', async () => {
        const actual = await import('headless-route')
        return {
          ...actual,
          createRoutes: vi.fn().mockResolvedValueOnce([
            { id: 'pages/foo.html', url: '/foo.html' },
            { id: 'pages/bar.html', url: '/bar.html' }
          ])
        }
      })

      await api.init()

      expect(api.data.init).toHaveBeenCalled()
      expect(api.routes).toHaveLength(2)

      vi.clearAllMocks()
    })
  })

  describe('createRoute', () => {
    it('should create a new route instance with the provided ID', () => {
      const route = api.createRoute('pages/foo.html')
      expect(route).toEqual({
        context: {},
        id: 'pages/foo.html',
        index: false,
        isDynamic: false,
        stem: 'foo',
        url: '/foo.html'
      })
    })
  })

  describe('findNewRouteIndex', () => {
    it('should find the index for a new route in the routes array', () => {
      api.routes = [
        api.createRoute('pages/bar.html'),
        api.createRoute('pages/qux.html')
      ] as never

      const newRoute = api.createRoute('pages/foo.html')
      const index = api.findNewRouteIndex(newRoute)

      expect(index).toEqual(1)
    })
  })

  describe('findRouteIndex', () => {
    it('should find the index of a route based on its URL', () => {
      api.routes = [
        api.createRoute('pages/foo.html'),
        api.createRoute('pages/bar.html')
      ]
      const index = api.findRouteIndex('/bar.html')
      expect(index).toEqual(1)
    })

    it('should return -1 if the route is not found', () => {
      const index = api.findRouteIndex('/missing.html')
      expect(index).toEqual(-1)
    })
  })

  describe('isRouteExists', () => {
    it('should return true if a route with the given URL exists', () => {
      api.routes = [api.createRoute('pages/foo.html')]
      const exists = api.isRouteExists('/foo.html')
      expect(exists).toBe(true)
    })

    it('should return false if a route with the given URL does not exist', () => {
      const exists = api.isRouteExists('/missing.html')
      expect(exists).toBe(false)
    })
  })

  describe('getRoute', () => {
    it('should return the route corresponding to the given URL', () => {
      api.routes = [
        api.createRoute('pages/foo.html'),
        api.createRoute('pages/bar.html')
      ]
      const route = api.getRoute('/bar.html')

      expect(route).toEqual({
        context: {},
        id: 'pages/bar.html',
        index: false,
        isDynamic: false,
        stem: 'bar',
        url: '/bar.html'
      })
    })

    it('should return undefined if no route matches the given URL', () => {
      const route = api.getRoute('/missing.html')
      expect(route).toBeUndefined()
    })
  })

  describe('setRoute', () => {
    it('should set a new route if it does not already exist', () => {
      let position: number

      position = api.setRoute(api.createRoute('pages/bar.md'))
      expect(position).toBe(0)
      expect(
        loggedMessage?.endsWith(
          '\u001b[33msets\u001b[0m \u001b[2m/bar.html\u001b[0m'
        )
      ).toBeTruthy()

      position = api.setRoute(api.createRoute('pages/ab.md'))
      expect(position).toBe(0)
      expect(
        loggedMessage?.endsWith(
          '\u001b[33msets\u001b[0m \u001b[2m/ab.html\u001b[0m'
        )
      ).toBeTruthy()

      position = api.setRoute(api.createRoute('pages/qux.md'))
      expect(position).toBe(2)
      expect(
        loggedMessage?.endsWith(
          '\u001b[33msets\u001b[0m \u001b[2m/qux.html\u001b[0m'
        )
      ).toBeTruthy()

      position = api.setRoute(api.createRoute('pages/foo.md'))
      expect(position).toBe(2)
      expect(
        loggedMessage?.endsWith(
          '\u001b[33msets\u001b[0m \u001b[2m/foo.html\u001b[0m'
        )
      ).toBeTruthy()

      expect(api.routes.length).toBe(4)
    })

    it('should update an existing route if it exists', () => {
      const fooRoute = api.createRoute('pages/foo.html')
      api.setRoute(fooRoute)

      const updatedRoute = {
        ...fooRoute,
        updated: true
      }
      const position = api.setRoute(updatedRoute)

      expect(position).toEqual(0)
      expect(api.routes).toContainEqual(updatedRoute)
    })
  })

  describe('deleteRoute', () => {
    it('should delete the specified route', () => {
      const fooRoute = api.createRoute('pages/foo.html')
      const barRoute = api.createRoute('pages/bar.html')
      api.setRoute(fooRoute)
      api.setRoute(barRoute)

      const index = api.deleteRoute(fooRoute)

      expect(index).toEqual(1)
      expect(api.routes).not.toContainEqual(fooRoute)
      expect(
        loggedMessage?.endsWith(
          '\u001b[31mdeletes\u001b[0m \u001b[2m/foo.html\u001b[0m'
        )
      ).toBeTruthy()
    })

    it('should return -1 if the route to delete does not exist', () => {
      const fooRoute = api.createRoute('pages/foo.html')
      const index = api.deleteRoute(fooRoute)

      expect(index).toEqual(-1)
      expect(loggedMessage).toBeUndefined()
    })
  })

  describe('isWatchable', () => {
    it('should return true if the file is watchable', () => {
      const isWatchable = api.isWatchable('pages/page1.html')
      expect(isWatchable).toBe(true)
    })

    it('should return false if the file is not watchable', () => {
      const isWatchable = api.isWatchable('other/file.json')
      expect(isWatchable).toBe(false)
    })
  })

  describe('isMarkupRoute', () => {
    it('should return true if the file is a markup route', () => {
      const isMarkupRoute = api.isMarkupRoute('pages/page1.md')
      expect(isMarkupRoute).toBe(true)
    })

    it('should return false if the file is not a markup route', () => {
      const isMarkupRoute = api.isMarkupRoute('other/file.js')
      expect(isMarkupRoute).toBe(false)
    })
  })
})
