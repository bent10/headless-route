import type { CacheRoute, OptionsSync, Route } from '../types.js'
import { compareRoute } from '../utils.js'
import { visit } from './visitor.js'

// Initialize route cache
const cacheRouteSync: CacheRoute = {}

/**
 * Creates routes based on the specified options synchronously.
 *
 * @param options - Options for route creation.
 * @returns An array of routes.
 */
export function createRoutesSync(options: OptionsSync = {}): Route[] {
  const { dir = '.', cache } = options
  const cwd = process.cwd()
  const resolvedDir = dir.startsWith(cwd)
    ? dir.replace(cwd, '').replace(/^[/\\]+/, '') || '.'
    : dir

  if (cache && cacheRouteSync[dir]) {
    return (cacheRouteSync as unknown as CacheRoute)[dir]
  }

  const routes: Route[] = []
  visit({ ...options, root: resolvedDir, dir: resolvedDir }, routes)

  if (cache) {
    Object.assign(cacheRouteSync, { [dir]: routes })
  }

  return routes.sort(compareRoute)
}
