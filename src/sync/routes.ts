import type { CacheRoute, OptionsSync, Route, UnknownData } from '../types.js'
import { visit } from './visitor.js'

// Initialize route cache
const cacheRouteSync: CacheRoute = {}

/**
 * Creates routes based on the specified options synchronously.
 *
 * @param options - Options for route creation.
 * @returns An array of routes.
 */
export function createRoutesSync<Context extends UnknownData = UnknownData>(
  options: OptionsSync = {}
): Route<Context>[] {
  const { dir = '.', cache } = options
  const resolvedDir = dir === process.cwd() ? '.' : dir

  if (cache && cacheRouteSync[dir]) {
    return (cacheRouteSync as CacheRoute<Context>)[dir]
  }

  const routes: Route<Context>[] = []
  visit<Context>({ ...options, root: resolvedDir, dir: resolvedDir }, routes)

  if (cache) {
    cacheRouteSync[dir] = routes
  }

  return routes.sort((a, b) => {
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1

    return 0
  })
}
