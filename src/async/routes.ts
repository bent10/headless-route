import type { CacheRoute, Options, Route, UnknownData } from '../types.js'
import { visit } from './visitor.js'

// Initialize route cache
const cacheRoute: CacheRoute = {}

/**
 * Creates routes based on the specified options.
 *
 * @param options - Options for route creation.
 * @returns An array of routes.
 */
export async function createRoutes<Context extends UnknownData = UnknownData>(
  options: Options = {}
): Promise<Route<Context>[]> {
  const { dir = '.', cache } = options
  const resolvedDir = dir === process.cwd() ? '.' : dir

  if (cache && cacheRoute[dir]) {
    return (cacheRoute as CacheRoute<Context>)[dir]
  }

  const routes: Route<Context>[] = []
  await visit<Context>(
    { ...options, root: resolvedDir, dir: resolvedDir },
    routes
  )

  if (cache) {
    cacheRoute[dir] = routes
  }

  return routes.sort((a, b) => {
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1

    return 0
  })
}
