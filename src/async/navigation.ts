import type {
  NavigationHandlerFn,
  NavigationRoute,
  Route,
  RouteNotation,
  UnknownData
} from '../types.js'
import { createRouteNotation } from '../utils.js'

/**
 * Creates navigation routes from a list of routes.
 *
 * @param routes - An array of routes.
 * @returns A nested array representing the navigation routes.
 */
export async function createNavigation<
  Context extends UnknownData = UnknownData
>(
  routes: Route<Context>[],
  handler?: NavigationHandlerFn
): Promise<NavigationRoute<Context>[]> {
  const notation = createRouteNotation<Context>(routes)
  const root: { children: NavigationRoute<Context>[] } = { children: [] }

  await routeNotationToNavigationRoute<Context>(
    notation,
    root as NavigationRoute<Context>,
    handler
  )

  return root.children
}

/**
 * Converts route notation to a navigation routes structure.
 *
 * @param notation - Object notation representing the routes.
 * @param parent - The parent route in the nested structure.
 * @returns The navigation route with nested children.
 */
async function routeNotationToNavigationRoute<
  Context extends UnknownData = UnknownData
>(
  notation: RouteNotation<Context>,
  parent: NavigationRoute<Context>,
  handler?: NavigationHandlerFn
) {
  for (const key in notation) {
    const route = notation[key]
    if (route === null || typeof route !== 'object') continue

    // if a Route
    if (route.id && route.url) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = route
      await handler?.(rest as NavigationRoute<Context>, parent)
      parent.children?.push(rest as Route<Context>)

      continue
    }

    // if a notation route
    // push initial "layout route" for children
    const stem = parent.stem ? `${parent.stem}/${key}` : key
    const newRoute: NavigationRoute<Context> = {
      stem,
      url: `/${stem}`,
      index: true,
      isDynamic: key.startsWith(':'),
      children: []
    }
    const length = parent.children!.push(newRoute)
    const nextparent = parent?.children![length - 1]

    await handler?.(newRoute, nextparent)

    await routeNotationToNavigationRoute(
      route as RouteNotation<Context>,
      nextparent,
      handler
    )
  }

  return parent
}
