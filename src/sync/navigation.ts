import type {
  NavigationHandlerFnSync,
  NavigationRoute,
  Route,
  RouteNotation
} from '../types.js'
import { createParentRoute, createRouteNotation } from '../utils.js'

/**
 * Creates navigation routes from a list of routes synchronously.
 *
 * @param routes - An array of routes.
 * @param handler - A navigation route handler function.
 * @returns A nested array representing the navigation routes.
 */
export function createNavigationSync<Context extends object = object>(
  routes: Route<Context>[],
  handler?: NavigationHandlerFnSync
): NavigationRoute<Context>[] {
  const notation = createRouteNotation<Context>(routes)
  const root: { children: NavigationRoute<Context>[] } = { children: [] }

  routeNotationToNavigationRoute<Context>(
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
function routeNotationToNavigationRoute<Context extends object = object>(
  notation: RouteNotation<Context>,
  parent: NavigationRoute<Context>,
  handler?: NavigationHandlerFnSync
) {
  for (const segment in notation) {
    const route = notation[segment]
    /* c8 ignore next */
    if (route === null || typeof route !== 'object') continue

    // if a Route
    if (route.id && route.url) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...navRoute } = route
      handler?.(navRoute as NavigationRoute<Context>, parent)
      parent.children?.push(navRoute as Route<Context>)

      continue
    }

    // if a notation route
    const newRoute = createParentRoute(segment, parent)
    // push initial "layout route" for children
    const length = parent.children!.push(newRoute)
    const nextparent = parent?.children![length - 1]

    handler?.(newRoute, nextparent)

    routeNotationToNavigationRoute(
      route as RouteNotation<Context>,
      nextparent,
      handler
    )
  }

  return parent
}
