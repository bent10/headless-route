import type {
  NavigationHandlerFn,
  NavigationRoute,
  Route,
  RouteNotation
} from '../types.js'
import { createParentRoute, createRouteNotation } from '../utils.js'

/**
 * Creates navigation routes from a list of routes.
 *
 * @param routes - An array of routes.
 * @param handler - A navigation route handler function.
 * @returns A nested array representing the navigation routes.
 */
export async function createNavigation(
  routes: Route[],
  handler?: NavigationHandlerFn
): Promise<NavigationRoute[]> {
  const notation = createRouteNotation(routes)
  const root: { children: NavigationRoute[] } = { children: [] }

  await routeNotationToNavigationRoute(
    notation,
    root as NavigationRoute,
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
async function routeNotationToNavigationRoute(
  notation: RouteNotation,
  parent: NavigationRoute,
  handler?: NavigationHandlerFn
) {
  for (const segment in notation) {
    const route = notation[segment]
    /* c8 ignore next */
    if (route === null || typeof route !== 'object') continue

    // if a Route
    if (route.stem && route.url) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...navRoute } = route
      await handler?.(navRoute as NavigationRoute, parent)
      parent.children?.push(navRoute as Route)

      continue
    }

    // if a notation route
    const newRoute = createParentRoute(segment, parent)
    // push initial "layout route" for children
    const length = parent.children!.push(newRoute)
    const nextparent = parent?.children![length - 1]

    await handler?.(newRoute, nextparent)

    await routeNotationToNavigationRoute(
      route as RouteNotation,
      nextparent,
      handler
    )
  }

  return parent
}
