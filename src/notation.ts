import setValue from 'set-value'
import type { NavigationRoute, Route, UnknownData } from './types.js'

/** @private */
interface RouteNotation<Context extends UnknownData = UnknownData> {
  [segment: string]: Route<Context> | RouteNotation<Context>
}

/**
 * Creates nested object notation of routes.
 *
 * @param routes - An array of routes.
 * @returns Object notation representing the routes.
 */
export function createRouteNotation<Context extends UnknownData = UnknownData>(
  routes: Route<Context>[]
) {
  const notation: RouteNotation<Context> = {}

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
  Context extends UnknownData = UnknownData
>(notation: RouteNotation<Context>, parent: Partial<NavigationRoute<Context>>) {
  for (const key in notation) {
    const route = notation[key]
    if (route === null || typeof route !== 'object') continue

    // if a Route
    if (route.id && route.url) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = route
      parent.children?.push(rest as Route<Context>)

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
      route as RouteNotation<Context>,
      parent?.children![length - 1]
    )
  }

  return parent
}
