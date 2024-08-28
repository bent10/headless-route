import type { Dirent } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import normalizePath from 'normalize-path'
import type { Options, Route } from '../types.js'
import { createRoute, isIgnored, isValidExtension } from '../utils.js'

/**
 * Visits each file and directory to create routes.
 *
 * @param options - Options for visiting files and directories.
 * @param routes - An array to store the created routes.
 */
export async function visit(
  options: Omit<Options, 'cache'> & { root: string; dir: string },
  routes: Route[]
): Promise<void> {
  const {
    root,
    dir,
    urlPrefix,
    urlSuffix,
    extensions = ['.html', '.md'],
    filter = () => true,
    handler
  } = options

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

        const route = createRoute(id, { root, urlSuffix, urlPrefix })

        // call handler fn, useful to expand each route
        await handler?.(route, root)

        routes.push(route)
      }
    })
  )
}
