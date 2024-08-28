import type { CacheRoute, Options, Route } from '../types.js'
import { compareRoute } from '../utils.js'
import { visit } from './visitor.js'

// Initialize route cache
const cacheRoute: CacheRoute = {}

/**
 * Creates routes based on the specified options.
 *
 * @param options - Options for route creation.
 * @returns An array of routes.
 */
export async function createRoutes(options: Options = {}): Promise<Route[]> {
  const { dir = '.', cache } = options
  const cwd = process.cwd()
  const resolvedDir = dir.startsWith(cwd)
    ? dir.replace(cwd, '').replace(/^[\\/]+/, '') || '.'
    : dir

  if (cache && cacheRoute[dir]) {
    return (cacheRoute as unknown as CacheRoute)[dir]
  }

  const routes: Route[] = []
  await visit({ ...options, root: resolvedDir, dir: resolvedDir }, routes)

  if (cache) {
    Object.assign(cacheRoute, { [dir]: routes })
  }

  return routes.sort(compareRoute)
}
