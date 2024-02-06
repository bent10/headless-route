import type { Dirent } from 'node:fs'

/**
 * Options for creating routes.
 */
export interface Options<Context extends UnknownData = UnknownData> {
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
  handler?: HandlerFn<Context>
}

export interface OptionsSync<Context extends UnknownData = UnknownData>
  extends Omit<Options, 'filter' | 'handler'> {
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
  filter?: FilterFnSync

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
  handler?: HandlerFnSync<Context>
}

/**
 * A filter function for filtering Dirent objects.
 */
export type FilterFn = (file: Dirent) => boolean | Promise<boolean>

/**
 * A filter function for filtering Dirent objects.
 */
export type FilterFnSync = (file: Dirent) => boolean

/**
 * A handler function called for each route.
 */
export type HandlerFn<Context extends UnknownData = UnknownData> = (
  route: Route<Context>,
  root: string
) => void | Promise<void>

/**
 * A handler function called for each route.
 */
export type HandlerFnSync<Context extends UnknownData = UnknownData> = (
  route: Route<Context>,
  root: string
) => void

/**
 * Represents a map of parameters with string keys and string values.
 */
export type Params = {
  [paramId: string]: Param
}

export type Param = {
  pattern: string
  partial: boolean
}

/**
 * Represents a single route object.
 */
export interface Route<Context extends UnknownData = UnknownData> {
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
  context?: Context
}

/**
 * Represents a navigation route with additional data.
 */
export interface NavigationRoute<Context extends UnknownData = UnknownData>
  extends Omit<Route<Context>, 'id'> {
  /**
   * Children routes of the navigation route.
   */
  children?: NavigationRoute<Context>[]
}

/**
 * A navigation route handler function.
 */
export type NavigationHandlerFn<Context extends UnknownData = UnknownData> = (
  route: NavigationRoute<Context> | Route<Context>,
  parrent: NavigationRoute<Context>
) => void | Promise<void>

/**
 * A navigation route handler function.
 */
export type NavigationHandlerFnSync<Context extends UnknownData = UnknownData> =
  (
    route: NavigationRoute<Context> | Route<Context>,
    parrent: NavigationRoute<Context>
  ) => void

/**
 * Represents a cache of routes.
 */
export type CacheRoute<Context extends UnknownData = UnknownData> = {
  [key: string]: Route<Context>[]
}

/**
 * Represents additional data associated with routes.
 */
export interface UnknownData {
  [key: string]: unknown
}

/** @private */
export interface RouteNotation<Context extends UnknownData = UnknownData> {
  [segment: string]: Route<Context> | RouteNotation<Context>
}
