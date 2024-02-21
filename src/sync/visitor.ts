import { readdirSync, type Dirent } from 'node:fs'
import { extname, join } from 'node:path'
import normalizePath from 'normalize-path'
import type { OptionsSync, Route } from '../types.js'
import { createRoute, isIgnored, isValidExtension } from '../utils.js'

/**
 * Visits each file and directory to create routes synchronously.
 *
 * @param options - Options for visiting files and directories.
 * @param routes - An array to store the created routes.
 */
export function visit<Context extends object = object>(
  options: Omit<OptionsSync<Context>, 'cache'> & { root: string; dir: string },
  routes: Route<Context>[]
): void {
  const {
    root,
    dir,
    urlSuffix = '',
    extensions = ['.html', '.md'],
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

      const route = createRoute<Context>(id, { root, urlSuffix })

      // call handler fn, useful to expand each route
      handler?.(route, root)

      routes.push(route)
    }
  }
}
