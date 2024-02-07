import type { Dirent } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import normalizePath from 'normalize-path'
import type { Options, Route } from '../types.js'
import {
  applyDynamicRouteProps,
  escapeRegExp,
  isIgnored,
  isValidExtension
} from '../utils.js'
import { isDynamicRouteSegment, parseRoutePath } from '../segments.js'

/**
 * Visits each file and directory to create routes.
 *
 * @param options - Options for visiting files and directories.
 * @param routes - An array to store the created routes.
 */
export async function visit<Context extends object = object>(
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

          const segments = parseRoutePath(routePath)

          const stem = segments.join('/')
          const url = `/${stem + urlSuffix}`
          const index = url.endsWith('/index' + urlSuffix)

          const route: Route<Context> = {
            id,
            stem,
            url,
            index,
            isDynamic: false
          }

          const isDynamic = segments.some(isDynamicRouteSegment)

          if (isDynamic) {
            applyDynamicRouteProps<Context>(route)
          }

          // call handler fn, useful to expand each route
          await handler?.(route, root)

          routes.push(route)
        }
      })
    )
  } catch (error) {
    throw error
  }
}
