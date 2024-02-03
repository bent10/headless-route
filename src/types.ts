import type { Dirent } from 'node:fs'

/**
 * Represents a map of parameters with string keys and string values.
 */
export type Params = { [param: string]: string }

/**
 * Represents a single route object.
 */
export interface Route<Data extends UnknownData = UnknownData> {
  /**
   * The unique identifier for the route.
   */
  id: string

  /**
   * The stem of the route URL.
   */
  stem: string

  /**
   * The URL of the route.
   */
  url: string

  /**
   * Indicates whether the route is an index page.
   */
  index: boolean

  /**
   * Indicates whether the route is dynamic.
   */
  isDynamic: boolean

  /**
   * Optional parameters for the route.
   */
  params?: Params

  /**
   * Additional data associated with the route.
   */
  data?: Data
}

/**
 * Represents a navigation route with additional data.
 */
export interface NavigationRoute<Data extends UnknownData = UnknownData>
  extends Omit<Route<Data>, 'id'> {
  /**
   * Children routes of the navigation route.
   */
  children?: NavigationRoute<Data>[]
}

/**
 * Options for creating routes.
 */
export interface Options<Data extends UnknownData = UnknownData> {
  /**
   * The directory to scan for routes.
   */
  dir?: string

  /**
   * The file extensions to include when scanning for routes.
   *
   * @default ['.html', '.md', '.js']
   */
  extensions?: string[]

  /**
   * The suffix to append to route URLs.
   */
  urlSuffix?: string

  /**
   * Indicates whether to cache routes.
   */
  cache?: boolean

  /**
   * A filter function for filtering Dirent objects.
   *
   * @example
   * ```js
   * createRoutes({
   *   dir: 'pages',
   *   filter(file) {
   *     // ignore files starting with '_'
   *     return !file.name.startsWith('_')
   *   }
   * })
   * ```
   */
  filter?: FilterFn

  /**
   * A handler function called for each route.
   *
   * @example
   * ```js
   * createRoutes({
   *   dir: 'pages',
   *   handler(route) {
   *     if (route.id.endsWith('.js')) {
   *       // attach a lazy route for JavaScript files
   *       route.lazy = import(route.id)
   *     }
   *   }
   * })
   * ```
   */
  handler?: HandlerFn<Data>
}

/**
 * A filter function for filtering Dirent objects.
 */
export type FilterFn = (file: Dirent) => boolean

/**
 * A handler function called for each route.
 */
export type HandlerFn<Data extends UnknownData = UnknownData> = (
  route: Route<Data>,
  root: string
) => void

/**
 * Represents additional data associated with routes.
 */
export interface UnknownData {
  [key: string]: unknown
}

/**
 * Represents a cache of routes.
 */
export type CacheRoute<Data extends UnknownData = UnknownData> = {
  [key: string]: Route<Data>[]
}
