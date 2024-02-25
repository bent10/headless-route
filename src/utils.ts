import { readGitignore } from 'gitignore-reader'
import _ignore, { type Ignore, type Options as IgOptions } from 'ignore'
import { compile, match, pathToRegexp } from 'path-to-regexp'
import setValue from 'set-value'
import {
  isDynamicRouteSegment,
  normalizeSegment,
  routeSegments
} from './segments.js'
import type { NavigationRoute, Route, RouteNotation } from './types.js'

type IgnoreFn = (options?: IgOptions) => Ignore

const ignore = (_ignore as unknown as IgnoreFn)().add(readGitignore())

export function sortRoutes(routes: Route[]) {
  return routes.sort((a, b) => {
    if (a.id < b.id) return -1
    /* c8 ignore next 3 */
    if (a.id > b.id) return 1

    return 0
  })
}

/**
 * Checks if a given path is ignored according to the rules specified in the
 * project's `.gitignore` file.
 *
 * @param id The id to check for ignoring.
 * @returns A boolean indicating whether the id is ignored.
 */
export function isIgnored(id: string) {
  return ignore.ignores(id)
}

/**
 * Checks if the provided file extension is allowed based on the allowed
 * extensions array.
 *
 * @param extensions - An array of allowed file extensions.
 * @param fileExtension - The file extension to check.
 * @returns True if the file extension is allowed, otherwise false.
 */
export function isValidExtension(extensions: string[], fileExtension: string) {
  return extensions.includes(fileExtension) || extensions.includes('*')
}

/**
 * Creates a route object based on the provided id and options.
 *
 * @param id - The ID of the route.
 * @param options - Configuration options for creating the route.
 * @returns A Route object representing the created route.
 */
export function createRoute(
  id: string,
  options: { root: string; urlSuffix: string }
): Route {
  const { root, urlSuffix } = options

  const segments = routeSegments(id, root)
  const stem = segments.join('/')
  const url = `/${stem + urlSuffix}`
  const index = url.endsWith('/index' + urlSuffix)

  const route: Route = { id, stem, url, index, isDynamic: false }

  const isDynamic = segments.some(isDynamicRouteSegment)

  if (isDynamic) {
    applyDynamicRouteProps(route)
  }

  return route
}

/**
 * Creates a parent route object based on the provided segment and parent
 * route.
 *
 * @param segment - The segment of the route.
 * @param parent - The parent route object.
 * @returns A NavigationRoute object representing the created parent route.
 */
export function createParentRoute(
  segment: string,
  parent: NavigationRoute
): NavigationRoute {
  const stem = parent.stem ? `${parent.stem}/${segment}` : segment

  // initial "layout route" for children
  return {
    stem,
    url: `/${stem}`,
    index: true,
    isDynamic: isDynamicRouteSegment(segment),
    children: []
  }
}

/**
 * Creates nested object notation of routes.
 *
 * @param routes - An array of routes.
 * @returns Object notation representing the routes.
 */
export function createRouteNotation(routes: Route[]) {
  const notation: RouteNotation = {}

  for (const route of routes) {
    setValue(notation, route.stem, route, {
      separator: '/'
    })
  }

  return notation
}

/**
 * Finds a route that matches the provided request URL.
 *
 * @param requestUrl - The URL of the request.
 * @param routes - An array of routes to search.
 * @returns The matching route, if found, otherwise undefined.
 */
export function findRoute(requestUrl: string, routes: Route[]) {
  return routes.find(route => {
    if (route.isDynamic) {
      return route.isMatch?.(requestUrl)
    }

    const regexp = pathToRegexp(route.url)
    return regexp.test(normalizeSegment(requestUrl))
  })
}

/**
 * Applies dynamic route properties to the provided route object.
 *
 * @param route - The route object to which dynamic properties are applied.
 */
export function applyDynamicRouteProps(route: Route) {
  const regexp = pathToRegexp(route.url)
  const fnMatch = match(route.url, {
    encode: encodeURI
  })
  const fnCompile = compile(route.url, {
    encode: encodeURIComponent
  })

  Object.assign(route, { isDynamic: true })
  // non-enumerable props for dynamic route
  Object.defineProperties(route, {
    isMatch: {
      value: (input: string) => regexp.test(normalizeSegment(input))
    },
    matchParams: {
      value: (input: string) => {
        const result = fnMatch(input)
        return result ? { ...result.params } : false
      }
    },
    generatePath: { value: (data: object) => fnCompile(data) }
  })
}
