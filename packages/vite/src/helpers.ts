import { log } from 'node:console'
import { createNavigationSync } from 'headless-route'
import { BaseRoute, Route, RouteWith, RouteWithContext } from './types.js'

type NavigationProps = {
  isDynamic: boolean
  id?: string
  type?: 'root'
  icon?: string
  children?: RouteWith[]
}

type NavigationMeta = {
  [stem: string]:
    | PrimitiveValue
    | PrimitiveValue[]
    | Record<string, PrimitiveValue>
}

type PrimitiveValue =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | symbol
  | null

/**
 * Defines helper functions for working with routes.
 *
 * @param routes - An array of routes to generate helpers for.
 * @returns An object containing helper functions.
 */
export default function defineHelpers(routes: RouteWithContext[]) {
  return {
    log,
    dump,
    escape,
    getNavigation(urlPrefix: string, navMeta: NavigationMeta = {}) {
      const _routes = routes.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id, context, ...baseRoute }) => baseRoute
      ) as BaseRoute[]

      return buildNavigation(_routes, urlPrefix, navMeta)
    }
  }
}

/**
 * Serializes an object to a JSON string, escaping functions and strings.
 *
 * @param input - The input object to stringify.
 * @returns The JSON string representation of the input.
 */
function dump(input: unknown) {
  return JSON.stringify(
    input,
    (_, val) => {
      if (typeof val === 'function') return escape(String(val))
      else if (typeof val === 'string') return escape(val)
      else return val
    },
    2
  )
}

/**
 * Escapes special characters in a string using HTML entity encoding.
 *
 * @param str - The string to escape.
 * @returns The escaped string.
 */
function escape(str: string): string {
  const escapeChars: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }

  return str.replace(/[&<>"'`]/g, match => escapeChars[match])
}

/**
 * A utility for building navigation routes.
 */
function buildNavigation(
  routes: Route[],
  urlPrefix = '/',
  navMeta: NavigationMeta = {}
) {
  const filteredRoutes = routes.filter(({ url }) =>
    url.startsWith(urlPrefix)
  ) as Route[]

  if (!filteredRoutes.length) return [] as RouteWith<NavigationProps>[]

  const navigation = createNavigationSync(filteredRoutes, route => {
    const segments = route.stem.split('/').slice(1)
    const lastSegment = String(segments.pop()).replace(/\-/g, ' ')
    const text =
      lastSegment.slice(0, 1).toUpperCase() + lastSegment.slice(1).toLowerCase()

    if ('children' in route) {
      segments.length
        ? Object.assign(route, { id: route.stem.replace(/\//g, '-') })
        : Object.assign(route, { type: 'group' })
    }

    Object.assign(route, { text }, navMeta[route.stem])
  }) as RouteWith<NavigationProps>[]

  return navigation[0].children || navigation
}
