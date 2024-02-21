import type { Dirent } from 'node:fs'

/**
 * Options for creating routes.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface Options<Context extends object = object> {
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
   * The suffix to append to route URLs.
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
  handler?: HandlerFn<Context>
}

/**
 * Options for creating sync routes.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface OptionsSync<Context extends object = object>
  extends Omit<Options, 'filter' | 'handler'> {
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
 *
 * @template Context The type of additional context data associated with the route.
 */
export type HandlerFn<Context extends object = object> = (
  route: Route<Context>,
  root: string
) => void | Promise<void>

/**
 * A handler function called for each route.
 *
 * @template Context The type of additional context data associated with the route.
 */
export type HandlerFnSync<Context extends object = object> = (
  route: Route<Context>,
  root: string
) => void

/**
 * Represents the base structure of a route.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface BaseRoute<Context extends object = object> {
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
   * Additional data associated with the route.
   */
  context?: Context

  /**
   * Indicates whether the route is dynamic.
   */
  isDynamic: false
}

/**
 * Represents a dynamic route, which can match and generate URLs
 * dynamically.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface DynamicRoute<Context extends object = object>
  extends Omit<BaseRoute<Context>, 'isDynamic'> {
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
 *
 * @template Context The type of additional context data associated with the route.
 */
export type Route<Context extends object = object> =
  | BaseRoute<Context>
  | DynamicRoute<Context>

/**
 * Represents a navigation route, which extends the base route structure and
 * can have children routes.
 *
 * @template Context The type of additional context data associated with the route.
 */
export interface NavigationRoute<Context extends object = object>
  extends Omit<Route<Context>, 'id'> {
  /**
   * Children routes of the navigation route.
   */
  children?: NavigationRoute<Context>[]
}

/**
 * A navigation route handler function.
 *
 * @template Context The type of additional context data associated with the route.
 */
export type NavigationHandlerFn<Context extends object = object> = (
  route: NavigationRoute<Context> | Route<Context>,
  parrent: NavigationRoute<Context>
) => void | Promise<void>

/**
 * A navigation route handler function.
 *
 * @template Context The type of additional context data associated with the route.
 */
export type NavigationHandlerFnSync<Context extends object = object> = (
  route: NavigationRoute<Context> | Route<Context>,
  parrent: NavigationRoute<Context>
) => void

/**
 * Represents a cache of routes.
 *
 * @template Context The type of additional context data associated with the route.
 */
export type CacheRoute<Context extends object = object> = {
  [key: string]: Route<Context>[]
}

/** @private */
export interface RouteNotation<Context extends object = object> {
  [segment: string]: Route<Context> | RouteNotation<Context>
}
