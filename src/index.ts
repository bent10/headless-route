import { createRouteNotation, routeNotationToNestedRoute } from './notation.js'
import type {
  CacheRoute,
  NavigationHandlerFn,
  NavigationRoute,
  Options,
  Route,
  UnknownData
} from './types.js'
import { visit } from './visitor.js'

// Initialize route cache
const cacheRoute: CacheRoute = {}

/**
 * Creates routes based on the specified options.
 *
 * @param options - Options for route creation.
 * @returns An array of routes.
 */
export function createRoutes<Context extends UnknownData = UnknownData>(
  options: Options = {}
): Route<Context>[] {
  const { dir = '.', cache } = options
  const resolvedDir = dir === process.cwd() ? '.' : dir

  if (cache && cacheRoute[dir]) {
    return (cacheRoute as CacheRoute<Context>)[dir]
  }

  const routes: Route<Context>[] = []
  visit<Context>({ ...options, root: resolvedDir, dir: resolvedDir }, routes)

  if (cache) {
    cacheRoute[dir] = routes
  }

  return routes.sort((a, b) => {
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1

    return 0
  })
}

/**
 * Creates a navigation structure from a list of routes.
 *
 * @param routes - An array of routes.
 * @returns A nested array representing the navigation structure.
 */
export function createNavigation<Context extends UnknownData = UnknownData>(
  routes: Route<Context>[],
  handler?: NavigationHandlerFn
): NavigationRoute<Context>[] {
  const notation = createRouteNotation<Context>(routes)
  const root: { children: NavigationRoute<Context>[] } = { children: [] }

  routeNotationToNestedRoute<Context>(
    notation,
    root as NavigationRoute<Context>,
    handler
  )

  return root.children
}

export type * from './types.js'
