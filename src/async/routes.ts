import type { CacheRoute, Options, Route } from '../types.js'
import { sortRoutes } from '../utils.js'
import { visit } from './visitor.js'

// Initialize route cache
const cacheRoute: CacheRoute = {}

/**
 * Creates routes based on the specified options.
 *
 * @param options - Options for route creation.
 * @returns An array of routes.
 */
export async function createRoutes<Context extends object = object>(
  options: Options<Context> = {}
): Promise<Route<Context>[]> {
  const { dir = '.', cache } = options
  const resolvedDir = dir === process.cwd() ? '.' : dir

  if (cache && cacheRoute[dir]) {
    return (cacheRoute as unknown as CacheRoute<Context>)[dir]
  }

  const routes: Route<Context>[] = []
  await visit<Context>(
    { ...options, root: resolvedDir, dir: resolvedDir },
    routes
  )

  if (cache) {
    Object.assign(cacheRoute, { [dir]: routes })
  }

  return sortRoutes(routes)
}
