import { readdirSync, type Dirent } from 'node:fs'
import { extname, join } from 'node:path'
import normalizePath from 'normalize-path'
import type { Options, Params, Route, UnknownData } from './types.js'
import { escapeRegExp, isDynamicRouteSegment, isIgnored } from './utils.js'

/**
 * Visits each file and directory to create routes.
 *
 * @param options - Options for visiting files and directories.
 * @param routes - An array to store the created routes.
 */
export function visit<Context extends UnknownData = UnknownData>(
  options: Omit<Options<Context>, 'cache'> & { root: string; dir: string },
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
        if (isDynamicRouteSegment(segment)) {
          isDynamic = true
          return `:${segment.slice(1)}`
        }

        return segment
      })

      const stem = segments.join('/')
      const url = `/${stem + urlSuffix}`
      const index = url.endsWith('/index' + urlSuffix)

      const route: Route<Context> = { id, stem, url, index, isDynamic }

      let currSegment = ''
      if (isDynamic) {
        route.params = segments.reduce((params, segment) => {
          currSegment += `/${segment}`

          if (isDynamicRouteSegment(segment)) {
            params[segment] = currSegment
          }

          return params
        }, {} as Params)
      }

      // call handler fn, useful to expand each route
      handler?.(route, root)

      routes.push(route)
    }
  }
}

/**
 * Checks if the provided file extension is allowed based on the allowed extensions array.
 * @param extensions - An array of allowed file extensions.
 * @param fileExtension - The file extension to check.
 * @returns True if the file extension is allowed, otherwise false.
 */
function isValidExtension(extensions: string[], fileExtension: string) {
  return extensions.includes(fileExtension) || extensions.includes('*')
}
