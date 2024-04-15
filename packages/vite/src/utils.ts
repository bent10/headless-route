import { relative, resolve } from 'node:path'
import { createNavigationSync } from 'headless-route'
import { createLogger, normalizePath } from 'vite'
import type {
  FilterRoutesFn,
  NavigationMeta,
  RouteWith,
  RouteWithContext
} from './types.js'

/**
 * A utility for building navigation routes.
 */
export function buildNavigation<T extends object = object>(
  routes: RouteWithContext[],
  urlPrefix = '/',
  navMeta: NavigationMeta = {},
  filterFn: FilterRoutesFn = () => true
): RouteWith<T>[] {
  const filteredRoutes = routes
    .filter(({ url }) => url.startsWith(urlPrefix))
    .filter(filterFn)

  if (!filteredRoutes.length) return <RouteWith<T>[]>[]

  const navigation = createNavigationSync(filteredRoutes, route => {
    const segments = route.stem.split('/').slice(1)
    const lastSegment = String(
      segments.length ? segments.pop() : route.stem
    ).replace(/\-/g, ' ')
    const text =
      lastSegment.slice(0, 1).toUpperCase() + lastSegment.slice(1).toLowerCase()

    if ('children' in route) {
      segments.length
        ? Object.assign(route, { id: route.stem.replace(/\//g, '-') })
        : Object.assign(route, { type: 'group' })
    }

    Object.assign(route, { text }, navMeta[route.stem])
  }) as RouteWith<T>[]

  return navigation
}

/**
 * Transforms an absolute path to a relative path based on the current working
 * directory.
 *
 * @param path The absolute path to transform.
 * @returns The relative path.
 */
export function toRelativePath(path: string) {
  return normalizePath(relative(process.cwd(), resolve(path)) || '.')
}

/**
 * Recursively freezes an object and its properties.
 *
 * @param obj The object to be deeply frozen.
 * @returns The deeply frozen object.
 */
export function deepFreeze<T extends object = object>(
  obj: T,
  visited = new Set()
): Readonly<T> {
  if (visited.has(obj)) {
    return obj
  }

  visited.add(obj)

  for (const key in obj) {
    deepFreeze(obj[key as never], visited)
  }

  return Object.freeze(obj)
}

/**
 * Recursively unfreezes an object and its properties.
 *
 * @param obj The object to be deeply unfrozen.
 * @returns The deeply unfrozen object.
 */
export function deepUnfreeze<T extends object = object>(obj: Readonly<T>): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    const newArr = new Array(obj.length)
    for (let i = 0; i < obj.length; i++) {
      newArr[i] = deepUnfreeze(obj[i])
    }
    return newArr as unknown as T
  }

  const newObj = Object.create(null)
  for (const name in obj) {
    newObj[name] = deepUnfreeze(obj[name as never])
  }
  return newObj
}

const logger = createLogger()

/**
 * Logs an action related to a page with the specified ID and state.
 *
 * @param id - The ID of the page.
 * @param state - The state of the action ('reload', 'set', or 'delete').
 */
export function actionLog(id: string, state: 'reload' | 'set' | 'delete') {
  const states = {
    reload: '\x1b[32m',
    set: '\x1b[33m',
    delete: '\x1b[31m'
  }

  logger.info(`${states[state]}${state}s\x1b[0m \x1b[2m${id}\x1b[0m`, {
    timestamp: true
  })
}
