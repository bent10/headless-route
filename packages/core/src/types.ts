import type { Dirent } from 'node:fs'

/**
 * Options for creating routes.
 */
export interface Options {
  /**
   * The directory to scan for routes.
   */
  dir?: string

  /**
   * The file extensions to include when scanning for routes.
   *
   * @default ['.html', '.md']
   */
  extensions?: string[]

  /**
   * Defines the prefix to prepend to route URLs. Acceptable values include:
   *
   * - Absolute URL pathname, e.g., `/foo/`
   * - Full URL, e.g., `https://foo.com/`
   * - Empty string or `./`
   *
   * @default '/'
   */
  urlPrefix?: string

  /**
   * Defines the suffix to append to route URLs.
   */
  urlSuffix?: string

  /**
   * Indicates whether to cache routes.
   */
  cache?: boolean

  /**
   * A filter function for filtering [`Dirent`](https://nodejs.org/api/fs.html#class-fsdirent) objects. It automatically disregards files
   * and directories listed in the project's `.gitignore` file, ensuring they are
   * consistently excluded from consideration.
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
  handler?: HandlerFn
}

/**
 * Options for creating sync routes.
 */
export interface OptionsSync extends Omit<Options, 'filter' | 'handler'> {
  /**
   * A filter function for filtering [`Dirent`](https://nodejs.org/api/fs.html#class-fsdirent) objects. It automatically disregards files
   * and directories listed in the project's `.gitignore` file, ensuring they are
   * consistently excluded from consideration.
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
  handler?: HandlerFnSync
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
export type HandlerFn = (route: Route, root: string) => void | Promise<void>

/**
 * A handler function called for each route.
 */
export type HandlerFnSync = (route: Route, root: string) => void

/**
 * Represents the base structure of a route.
 */
export interface BaseRoute {
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
  isDynamic: false
}

/**
 * Represents a dynamic route, which can match and generate URLs
 * dynamically.
 */
export interface DynamicRoute extends Omit<BaseRoute, 'isDynamic'> {
  /**
   * Indicates whether the route is dynamic.
   */
  isDynamic: true

  /**
   * Function to check if the given input matches the route.
   *
   * @param input The input to match against the route.
   * @returns A boolean indicating whether the input matches the route.
   */
  isMatch: (input: string) => boolean

  /**
   * Function to extract parameters from the given input if it matches the route.
   *
   * @template Params The type of parameters extracted from the input.
   * @param input The input to extract parameters from.
   * @returns The extracted parameters if the input matches the route, otherwise false.
   */
  matchParams: <Params extends object = object>(input: string) => false | Params

  /**
   * Function to generate a URL using the provided parameters.
   *
   * @template Params The type of parameters used to generate the URL.
   * @param params The parameters used to generate the URL.
   * @returns The generated URL.
   */
  generatePath: <Params extends object = object>(params: Params) => string
}

/**
 * Represents a route, which can be either a base route or a dynamic route.
 */
export type Route = BaseRoute | DynamicRoute

/**
 * Represents a navigation route, which extends the base route structure and
 * can have children routes.
 */
export interface NavigationRoute extends Omit<Route, 'id'> {
  /**
   * Children routes of the navigation route.
   */
  children?: NavigationRoute[]
}

/**
 * A navigation route handler function.
 */
export type NavigationHandlerFn = (
  route: NavigationRoute | Route,
  parrent: NavigationRoute
) => void | Promise<void>

/**
 * A navigation route handler function.
 */
export type NavigationHandlerFnSync = (
  route: NavigationRoute | Route,
  parrent: NavigationRoute
) => void

/**
 * Represents a cache of routes.
 */
export type CacheRoute = {
  [key: string]: Route[]
}

/** @private */
export interface RouteNotation {
  [segment: string]: Route | RouteNotation
}
