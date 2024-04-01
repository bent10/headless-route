import { readFileSync } from 'node:fs'
import grayMatter from 'gray-matter'
import {
  compareRoute,
  createRoute,
  createRoutes,
  findRoute
} from 'headless-route'
import setValue from 'set-value'
import type { HtmlTagDescriptor } from 'vite'
import { devCache } from './Cache.js'
import { DataStore } from './DataStore.js'
import type {
  Breadcrumb,
  HeadlessRouteOptions,
  MatterData,
  NavigationMeta,
  Route,
  RouteWithContext
} from './types.js'
import { actionLog, buildNavigation } from './utils.js'

/**
 * Provides functionality for managing routes, data, and other operations
 * related to [headless-route](https://github.com/bent10/headless-route).
 */
export class Api {
  /**
   * An array of file extensions considered as markup files.
   */
  static MARKUP_EXTENSIONS = ['.md', '.mdx', '.html']

  /**
   * The data store.
   */
  data: DataStore

  /**
   * The handler function for route processing.
   */
  handler: Required<HeadlessRouteOptions['handler']>

  /**
   * The configuration options for the routes.
   */
  routesConfig: Required<
    Omit<HeadlessRouteOptions, 'fallbackRoute' | 'handler' | 'dataOptions'>
  >

  /**
   * The list of routes.
   */
  routes: RouteWithContext[] = []

  /**
   * A record of resolved route IDs and URLs, uses for build purposes.
   */
  resolvedRouteIds: Record<string, { id: string; url: string }> = {}

  /**
   * Current HTML tag descriptor.
   */
  currentHtmlTagDescriptor: HtmlTagDescriptor[] = []

  #fallbackRoute: string

  /**
   * Creates an instance of the `Api` class.
   *
   * @param options - The options for configuring the `Api`.
   */
  constructor(options: HeadlessRouteOptions = {}) {
    const {
      fallbackRoute = '/404',
      handler = {},
      dataOptions,
      ...routesOptions
    } = options

    this.routesConfig = {
      dir: 'pages',
      extensions: ['.html', '.md'],
      urlSuffix: '.html',
      filter: () => true,
      ...routesOptions
    }
    this.handler = handler

    this.data = new DataStore({
      ...dataOptions,
      localDataDir: this.routesConfig.dir
    })

    this.#fallbackRoute = this.#normalizeReqUrl(fallbackRoute)
  }

  /**
   * Gets the fallback route.
   */
  get fallbackRoute() {
    return this.getRoute(this.#fallbackRoute)
  }

  /**
   * Initializes the API by initializing data and routes.
   */
  async init() {
    devCache.clear()

    // init data
    await this.data.init()

    // init routes
    const _routes = await createRoutes(this.routesConfig)
    this.routes = _routes.map(r => {
      Object.assign(r, { context: {} })
      return r
    }) as RouteWithContext[]
  }

  /**
   * Creates a new route instance based on the provided ID.
   *
   * @param id - The ID for the new route.
   * @returns A new route instance.
   */
  createRoute(id: string) {
    const newRoute = createRoute(id, {
      root: this.routesConfig.dir,
      urlSuffix: this.routesConfig.urlSuffix
    })

    return Object.assign(newRoute, { context: {} }) as RouteWithContext
  }

  /**
   * Finds the index of the new route in the routes array.
   *
   * @param newRoute - The new route to find the index for.
   * @returns The index of the new route in the routes array.
   */
  findNewRouteIndex(newRoute: RouteWithContext) {
    let position = 0
    this.routes.forEach((route, i) => {
      if (compareRoute(route, newRoute) < 1) position = i + 1
    })

    return position
  }

  /**
   * Finds the index of a route in the routes array based on its URL.
   *
   * @param url - The URL of the route to find.
   * @returns The index of the route in the routes array, or `-1` if not found.
   */
  findRouteIndex(url: string) {
    const route = this.getRoute(url)

    if (!route) return -1

    return this.routes.findIndex(({ id }) => id === route.id)
  }

  /**
   * Checks if a route with a given URL exists.
   *
   * @param url - The URL of the route to check.
   * @returns `true` if the route exists, otherwise `false`.
   */
  isRouteExists(url: string) {
    return typeof this.getRoute(url) === 'object'
  }

  /**
   * Gets a route based on its URL.
   *
   * @param url - The URL of the route to get.
   * @returns The route corresponding to the URL, or `undefined` if not
   *   found.
   */
  getRoute(url: string) {
    return findRoute(this.#normalizeReqUrl(url), this.routes as Route[]) as
      | RouteWithContext
      | undefined
  }

  /**
   * Sets a new route or updates an existing one.
   *
   * @param newRoute - The new route to set.
   * @returns The index of the newly set or updated route.
   */
  setRoute(newRoute: RouteWithContext) {
    if (!this.routes.length) {
      const length = this.routes.push(newRoute)
      actionLog(newRoute.url, 'set')
      return length - 1
    }

    const _route = this.getRoute(newRoute.url)
    const isUpdateable = !!_route && !_route.isDynamic
    let position: number

    // update or add new route
    if (isUpdateable) {
      position = this.routes.findIndex(({ id }) => id === _route.id)
      this.routes[position] = newRoute
    } else {
      position = this.findNewRouteIndex(newRoute)
      this.routes.splice(position, 0, newRoute)
    }

    actionLog(newRoute.url, 'set')

    return position
  }

  /**
   * Deletes a route.
   *
   * @param route - The route to delete.
   * @returns The index of the deleted route.
   */
  deleteRoute(route: RouteWithContext) {
    const routeIndex = this.findRouteIndex(route.url)

    if (routeIndex > -1) {
      this.routes.splice(routeIndex, 1)
      actionLog(route.url, 'delete')
    }

    return routeIndex
  }

  /**
   * Checks if a file is watchable.
   *
   * @param id - The ID of the file to check.
   * @returns `true` if the file is watchable, otherwise `false`.
   */
  isWatchable(id: string) {
    return (
      id.startsWith(this.routesConfig.dir) ||
      id.startsWith(this.data.config.dir)
    )
  }

  /**
   * Checks if a file is a markup route.
   *
   * @param id - The ID of the file to check.
   * @returns `true` if the file is a markup route, otherwise `false`.
   */
  isMarkupRoute(id: string) {
    return Api.MARKUP_EXTENSIONS.some(ext => id.endsWith(ext))
  }

  /**
   * Creates the context for a given route, incorporating data, helpers, and other
   * route-specific information.
   *
   * @param route - The route for which to create the context.
   */
  createRouteContext(route: RouteWithContext) {
    const routes = this.routes
    route.context = {
      ...this.data.join(),
      ...this.data.getRouteData(route.url, this.routesConfig.urlSuffix),
      breadcrumb: this.#createBreadcrumb(route),
      getNavigation(urlPrefix: string, navMeta: NavigationMeta = {}) {
        const _routes = routes.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ id, context, ...baseRoute }) => baseRoute
        ) as RouteWithContext[]

        return buildNavigation(_routes, urlPrefix, navMeta)
      }
    }
  }

  /**
   * Parses metadata from a route content.
   *
   * @param route - The route from which to parse metadata.
   * @param content - The content from which to parse metadata.
   * @returns The content with metadata parsed, and updates the route's
   *   context.
   */
  parseMetadata(route: RouteWithContext, content?: string) {
    const {
      id,
      context: { matter: _matter },
      ...baseRoute
    } = route

    if (!content) {
      content = readFileSync(id, 'utf8')
    }

    const { content: contentNoMatter, data } = grayMatter(content)
    const {
      layout,
      title = '',
      titleTemplate = '%s',
      ...restData
    } = { ..._matter, ...data }

    const matter: MatterData = {
      titleTemplate: titleTemplate.replace('%s', title),
      title,
      ...baseRoute,
      ...restData
    }

    if (layout) {
      matter.layout = String(layout).replace(/\..+/, '') + '.html'
    }

    setValue(route, 'context.matter', matter, {
      merge: this.data.config.merge
    })

    return contentNoMatter
  }

  /**
   * Creates a breadcrumb trail based on a route.
   *
   * @param route - The route for which to create the breadcrumb trail.
   * @param start - The index to start slicing the route's stem.
   * @param end - The index to end slicing the route's stem.
   * @returns An array of breadcrumb items, each containing text and href
   *   properties.
   */
  #createBreadcrumb(
    route: RouteWithContext,
    start = 0,
    end?: number
  ): Breadcrumb {
    const segments = route.stem.split('/').slice(start, end).reverse()
    const parents: string[] = []

    return segments
      .map((seg, i) => {
        if (i > 0) parents.push('..')

        return {
          text: seg[0].toUpperCase() + seg.slice(1),
          href: !parents.length ? null : parents.join('/')
        }
      })
      .reverse()
  }

  /**
   * Normalizes a request URL by appending a suffix if it doesn't already have
   * one.
   *
   * @param url - The URL to normalize. Defaults to `'/'`.
   * @returns The normalized URL with the suffix appended if necessary.
   */
  #normalizeReqUrl(url: string = '/') {
    const normalizedUrl = url === '/' ? '/index' : url.replace(/\/+$/, '')

    return normalizedUrl.endsWith(this.routesConfig.urlSuffix)
      ? normalizedUrl
      : normalizedUrl + this.routesConfig.urlSuffix
  }
}
