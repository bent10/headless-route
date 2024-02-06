import type { Dirent } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import normalizePath from 'normalize-path'
import type { Options, Route, UnknownData } from '../types.js'
import {
  createDynamicRouteParams,
  escapeRegExp,
  isDynamicRouteSegment,
  isIgnored,
  isValidExtension
} from '../utils.js'

/**
 * Visits each file and directory to create routes.
 *
 * @param options - Options for visiting files and directories.
 * @param routes - An array to store the created routes.
 */
export async function visit<Context extends UnknownData = UnknownData>(
  options: Omit<Options<Context>, 'cache'> & { root: string; dir: string },
  routes: Route<Context>[]
): Promise<void> {
  const {
    root,
    dir,
    urlSuffix = '',
    extensions = ['.html', '.md', '.js'],
    filter = () => true,
    handler
  } = options

  try {
    const files: Dirent[] = await readdir(dir, { withFileTypes: true })

    await Promise.all(
      files.map(async file => {
        if (!(await filter(file))) return

        const id = normalizePath(join(dir, file.name))

        if (file.isDirectory()) {
          await visit({ ...options, dir: id }, routes)
        } else {
          const fileExtension = extname(id)

          if (!isValidExtension(extensions, fileExtension) || isIgnored(id))
            return

          const routePath = id
            .replace(new RegExp(`^${escapeRegExp(root)}`), '')
            .replace(new RegExp(`${escapeRegExp(fileExtension)}$`), '')

          const normalizedRoutePath = routePath.startsWith('/')
            ? routePath.slice(1)
            : routePath

          const segments = normalizedRoutePath.split('/').map(segment => {
            // segment may include file names ordered numerically (e.g., 01-foo, 02-bar, etc.),
            // used for organizing routes in a specific order.
            return segment.replace(/^\d+[\-\_]/, '')
          })

          const isDynamic = segments.some(isDynamicRouteSegment)
          const stem = segments.join('/')
          const url = `/${stem + urlSuffix}`
          const index = url.endsWith('/index' + urlSuffix)

          const route: Route<Context> = { id, stem, url, index, isDynamic }

          if (isDynamic) {
            route.params = createDynamicRouteParams(segments)
          }

          // call handler fn, useful to expand each route
          await handler?.(route, root)

          routes.push(route)
        }
      })
    )
  } catch (error) {
    // Handle any errors here
    console.error('Error while visiting directory:', error)
  }
}
