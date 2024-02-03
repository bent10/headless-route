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
export function createRoutes<Data extends UnknownData = UnknownData>(
  options: Options = {}
): Route<Data>[] {
  const { dir = '.', cache } = options
  const resolvedDir = dir === process.cwd() ? '.' : dir

  if (cache && cacheRoute[dir]) {
    return (cacheRoute as CacheRoute<Data>)[dir]
  }

  const routes: Route<Data>[] = []
  visit<Data>({ ...options, root: resolvedDir, dir: resolvedDir }, routes)

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
export function createNavigation<Data extends UnknownData = UnknownData>(
  routes: Route<Data>[]
): NavigationRoute<Data>[] {
  const notation = createRouteNotation<Data>(routes)
  const root: { children: NavigationRoute<Data>[] } = { children: [] }

  routeNotationToNestedRoute<Data>(notation, root)

  return root.children
}

export type * from './types.js'
