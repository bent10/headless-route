import { loadFileSync } from 'loadee'
import type { Route, UnknownData } from '../src/index.js'

/**
 * Loads all `.data.js` files and assign for routes.
 */
export function loadDatafiles(route: Route, root: string) {
  const data: UnknownData = {}
  const dataExts = ['.json', '.yml', '.yaml', '.cjs']

  let currSegment = root

  route.stem.split('/').forEach(segment => {
    currSegment += `/${segment}`

    dataExts.forEach(ext => {
      try {
        const datafile =
          segment === 'index' ? `.data${ext}` : `/${segment}.data${ext}`
        const localData = loadFileSync(currSegment + datafile)

        Object.assign(data, localData)
      } catch {}
    })
  })

  route.data = data
}
