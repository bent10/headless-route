import setValue from 'set-value'
import type { NavigationRoute, Route, UnknownData } from './types.js'

/** @private */
interface RouteNotation<Data extends UnknownData = UnknownData> {
  [segment: string]: Route<Data> | RouteNotation<Data>
}

/**
 * Creates nested object notation of routes.
 *
 * @param routes - An array of routes.
 * @returns Object notation representing the routes.
 */
export function createRouteNotation<Data extends UnknownData = UnknownData>(
  routes: Route<Data>[]
) {
  const notation: RouteNotation<Data> = {}

  for (const route of routes) {
    setValue(notation, route.stem, route, {
      separator: '/'
    })
  }

  return notation
}

/**
 * Converts route notation to a nested route structure.
 *
 * @param notation - Object notation representing the routes.
 * @param parent - The parent route in the nested structure.
 * @returns The parent route with nested children.
 */
export function routeNotationToNestedRoute<
  Data extends UnknownData = UnknownData
>(notation: RouteNotation<Data>, parent: Partial<NavigationRoute<Data>>) {
  for (const key in notation) {
    const route = notation[key]
    if (route === null || typeof route !== 'object') continue

    // if a Route
    if (route.id && route.url) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = route
      parent.children?.push(rest as Route<Data>)

      continue
    }

    // if a notation route
    // push initial "layout route" for children
    const stem = parent.stem ? `${parent.stem}/${key}` : key
    const length = parent.children!.push({
      stem,
      url: `/${stem}`,
      index: true,
      isDynamic: key.startsWith(':'),
      children: []
    })
    routeNotationToNestedRoute(
      route as RouteNotation<Data>,
      parent?.children![length - 1]
    )
  }

  return parent
}
