import { readdirSync, type Dirent } from 'node:fs'
import { extname, join } from 'node:path'
import normalizePath from 'normalize-path'
import type { OptionsSync, Route, UnknownData } from '../types.js'
import {
  createDynamicRouteParams,
  escapeRegExp,
  isDynamicRouteSegment,
  isIgnored,
  isValidExtension
} from '../utils.js'

/**
 * Visits each file and directory to create routes synchronously.
 *
 * @param options - Options for visiting files and directories.
 * @param routes - An array to store the created routes.
 */
export function visit<Context extends UnknownData = UnknownData>(
  options: Omit<OptionsSync<Context>, 'cache'> & { root: string; dir: string },
  routes: Route<Context>[]
): void {
  const {
    root,
    dir,
    urlSuffix = '',
    extensions = ['.html', '.md', '.js'],
    filter = () => true,
    handler
  } = options

  const files: Dirent[] = readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    if (!filter(file)) continue

    const id = normalizePath(join(file.path, file.name))

    if (file.isDirectory()) {
      visit({ ...options, dir: id }, routes)
    } else {
      const fileExtension = extname(id)

      if (!isValidExtension(extensions, fileExtension) || isIgnored(id))
        continue

      let isDynamic = false
      const routePath = id
        .replace(new RegExp(`^${escapeRegExp(root)}`), '')
        .replace(new RegExp(`${escapeRegExp(fileExtension)}$`), '')

      const normalizedRoutePath = routePath.startsWith('/')
        ? routePath.substring(1)
        : routePath

      const segments = normalizedRoutePath.split('/').map(segment => {
        // segment may include file names ordered numerically (e.g., 01-foo, 02-bar, etc.),
        // used for organizing routes in a specific order.
        const normalizedSegment = segment.replace(/^\d+[\-\_]/, '')

        if (isDynamicRouteSegment(normalizedSegment)) {
          isDynamic = true
          return `:${normalizedSegment.slice(1)}`
        }

        return normalizedSegment
      })

      const stem = segments.join('/')
      const url = `/${stem + urlSuffix}`
      const index = url.endsWith('/index' + urlSuffix)

      const route: Route<Context> = { id, stem, url, index, isDynamic }

      if (isDynamic) {
        route.params = createDynamicRouteParams(segments)
      }

      // call handler fn, useful to expand each route
      handler?.(route, root)

      routes.push(route)
    }
  }
}
