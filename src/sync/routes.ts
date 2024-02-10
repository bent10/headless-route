import type { CacheRoute, OptionsSync, Route } from '../types.js'
import { sortRoutes } from '../utils.js'
import { visit } from './visitor.js'

// Initialize route cache
const cacheRouteSync: CacheRoute = {}

/**
 * Creates routes based on the specified options synchronously.
 *
 * @param options - Options for route creation.
 * @returns An array of routes.
 */
export function createRoutesSync<Context extends object = object>(
  options: OptionsSync<Context> = {}
): Route<Context>[] {
  const { dir = '.', cache } = options
  const resolvedDir = dir === process.cwd() ? '.' : dir

  if (cache && cacheRouteSync[dir]) {
    return (cacheRouteSync as unknown as CacheRoute<Context>)[dir]
  }

  const routes: Route<Context>[] = []
  visit<Context>({ ...options, root: resolvedDir, dir: resolvedDir }, routes)

  if (cache) {
    Object.assign(cacheRouteSync, { [dir]: routes })
  }

  return sortRoutes(routes)
}