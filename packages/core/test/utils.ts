import { loadFileSync } from 'loadee'
import type { Route } from '../src/index.js'

/**
 * Loads all `.context.js` files and assign for routes.
 */
export function loadDatafiles(route: Route, root: string) {
  const context: object = {}
  const dataExts = ['.data.json', '.data.yml', '.data.yaml', '.data.cjs']

  let currSegment = root

  route.stem.split('/').forEach(segment => {
    currSegment += segment === 'index' ? '' : `/${segment}`

    dataExts.forEach(ext => {
      try {
        const datafile =
          segment === 'index' ? `/index${ext}` : `/${segment + ext}`
        const localData = loadFileSync(currSegment + datafile)

        Object.assign(context, localData)
      } catch {
        /* empty */
      }
    })
  })

  Object.assign(route, { context })
}
