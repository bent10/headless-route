import { createRouteNotation, routeNotationToNestedRoute } from './notation.js'
import type {
  CacheRoute,
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

  return routes
}

/**
 * Creates a navigation structure from a list of routes.
 *
 * @param routes - An array of routes.
 * @returns A nested array representing the navigation structure.
 */
export function createNavigation<Context extends UnknownData = UnknownData>(
  routes: Route<Context>[]
): NavigationRoute<Context>[] {
  const notation = createRouteNotation<Context>(routes)
  const root: { children: NavigationRoute<Context>[] } = { children: [] }

  routeNotationToNestedRoute<Context>(notation, root)

  return root.children
}

export type * from './types.js'
