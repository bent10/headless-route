import { readdirSync, type Dirent } from 'node:fs'
import { extname, join } from 'node:path'
import normalizePath from 'normalize-path'
import type { Options, Params, Route, UnknownData } from './types.js'
import { escapeRegExp, isIgnored } from './utils.js'

/**
 * Visits each file and directory to create routes.
 *
 * @param options - Options for visiting files and directories.
 * @param routes - An array to store the created routes.
 */
export function visit<Data extends UnknownData = UnknownData>(
  options: Omit<Options<Data>, 'cache'> & { root: string; dir: string },
  routes: Route<Data>[]
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
      const ext = extname(id)

      if (!extensions.includes(ext) && !extensions.includes('*')) continue
      if (isIgnored(id)) continue

      const routePath = id
        .replace(new RegExp(`^${escapeRegExp(root)}`), '')
        .replace(new RegExp(`${escapeRegExp(ext)}$`), '')

      const stem = routePath.startsWith('/')
        ? routePath.substring(1)
        : routePath
      const url = `/${stem + urlSuffix}`
      const index = url.endsWith('/index' + urlSuffix)
      const segments = stem.split('/')
      const isDynamic = segments.some(seg => seg.startsWith(':'))

      const route: Route<Data> = { id, stem, url, index, isDynamic }

      let currSegment = ''
      if (isDynamic) {
        route.params = segments.reduce((params, segment) => {
          currSegment += `/${segment}`

          if (segment.startsWith(':')) {
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
