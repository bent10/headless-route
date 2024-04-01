import type { BaseRoute, Options, Route } from 'headless-route'
import type { PluginContextMeta } from 'rollup'

/**
 * Options for configuring the headless routes plugin.
 */
export interface HeadlessRouteOptions
  extends Omit<Options, 'cache' | 'handler'> {
  /**
   * Options for data.
   */
  dataOptions?: Omit<DataStoreOptions, 'localDataDir'>

  /**
   * A route handler object where keys are strings and values are route handler
   * functions or tuple. If the values is a tuple, the handler runs sequentially.
   */
  handler?: RouteHandler

  /**
   * The fallback route to redirect to if no matching route is found. The value
   * should begin with `'/'`.
   *
   * @default '/404'
   */
  fallbackRoute?: `/${string}`
}

export interface HeadlessRouteContextMeta extends PluginContextMeta {
  isHeadlessRoute: true
  route: RouteWithContext
}

/**
 * Options for data handling.
 */
export type DataStoreOptions = {
  /**
   * The directory where data files are located.
   */
  dir?: string

  /**
   * An array of file extensions considered as data files.
   */
  extensions?: DataExtension[]

  /**
   * The directory where local (route related) data files are located.
   */
  localDataDir?: string

  /**
   * The suffix for local data file names.
   */
  localDataSuffix?: string

  /**
   * Whether to merge data from different sources.
   */
  merge?: boolean

  /**
   * An array of glob patterns to exclude sources.
   */
  ignore?: string[]
}

/**
 * Represents valid extensions for data files.
 */
export type DataExtension = '.yml' | '.yaml' | '.json' | '.js' | '.mjs' | '.cjs'

/**
 * Represents a route handler object where keys are strings and values are
 * route handler functions.
 */
export type RouteHandler = {
  [key in string]?: RouteHandlerFn | Array<RouteHandlerFn | string>
}

/**
 * A function to handle route content.
 */
export type RouteHandlerFn<R extends RouteWithContext = RouteWithContext> = (
  this: R,
  content: string,
  root: string
) => Promise<string> | string

/**
 * Represents a route with additional properties.
 *
 * @template T - Additional properties to include in the route.
 */
export type RouteWith<T extends object = object> = Omit<
  BaseRoute,
  'id' | 'isDynamic'
> & {
  /**
   * Indicates whether the route is dynamic.
   */
  isDynamic: boolean
} & T

/**
 * Represents a route with additional context information. This type extends
 * the base `Route` type and adds a `context` property containing data and
 * utilities specific to the route.
 */
export type RouteWithContext = Route & {
  /**
   * The context associated with the route. This object provides access to
   * various data and helper functions within your components.
   */
  context: Context
}

/**
 * Context information associated with a route. This interface includes data
 * related to content, navigation, and other route-specific information.
 */
export interface Context extends ContentData {
  /**
   * The base directory of the project.
   */
  baseDir: string

  /**
   * The URL prefix for public assets.
   */
  public: string

  /**
   * The URL prefix for the current theme.
   */
  theme: string

  /**
   * Breadcrumb navigation items. This array contains objects with `text` and
   * `href` properties, representing the breadcrumb trail for the route.
   */
  breadcrumb: Breadcrumb

  /**
   * A utility function for building navigation routes. This function takes a URL
   * prefix and an optional map of navigation metadata and returns an array of
   * navigation routes.
   *
   * @example
   * ```html
   * <ui:nav.stacked
   *   items="{{getNavigation('/docs', navMeta)}}"
   *   meta="{{matter}}"
   * />
   * ```
   */
  getNavigation: NavigationBuilder

  /**
   * Additional context data. This allows you to store and access arbitrary data
   * within the route context.
   */
  [key: string]: unknown
}

/**
 * Defines a function type for building navigation routes. This function takes a
 * URL suffix and an optional map of navigation metadata and returns an array
 * of navigation routes with the specified properties.
 *
 * @param urlSuffix - The suffix to append to the URL of each
 *   navigation route.
 * @param navMeta - An optional object mapping route stems to their corresponding
 *   metadata. This metadata can be used to add custom properties to the
 *   navigation routes, such as icons or additional data.
 * @returns An array of navigation routes with the specified properties.
 */
export type NavigationBuilder<T extends object = object> = (
  urlSuffix: string,
  navMeta?: NavigationMeta
) => RouteWith<T>[]

/**
 * Represents an object mapping route stems to their corresponding
 * navigation metadata. This metadata can be used to add custom properties
 * to the navigation routes, such as icons or additional data.
 */
export interface NavigationMeta {
  [stem: string]: { [key: string]: unknown }
}

/**
 * Breadcrumb navigation item with text and href properties.
 */
export type Breadcrumb = Array<{
  /**
   * The text of the breadcrumb.
   */
  text: string

  /**
   * The URL of the breadcrumb, or null if it is a placeholder.
   */
  href: string | null
}>

/**
 * Data associated with content.
 */
export interface ContentData {
  /**
   * Metadata extracted from the content matter.
   */
  matter?: MatterData

  /**
   * Headings extracted from the content.
   */
  headings?: Heading[]
}

/**
 * Metadata extracted from content matter.
 */
export interface MatterData
  extends Omit<Route, 'id' | 'context' | 'isDynamic'> {
  /**
   * The template string that will be rendered in the `<title>` tag. Must
   * contain `%s`, it will be replaced with the `title` prop.
   *
   * 🚩 **Tips:** Define `titleTemplate` only in "Layout route", it will be
   * applied on child pages.
   *
   * @default '%s'
   */
  titleTemplate: string

  /**
   * The string that will be rendered in the `<title>` tag.
   *
   * @default ''
   */
  title: string

  /**
   * Specifies the layout template to be used.
   *
   * @default 'base'
   */
  layout?: string

  /**
   * Specifies the content block name with a block for inserting content
   *
   * @default 'content'
   */
  block?: string

  /**
   * Whether to include a table of contents. If set to `true`, the context
   * `headings` object will contain the necessary information to generate and
   * display a comprehensive overview of the content structure.
   *
   * @default false
   */
  toc?: boolean

  /**
   * Describes an HTML tag along with its attributes, children, and injection
   * location.
   */
  htmlTagsDescriptor?: HtmlTagDescriptor[]

  /**
   * Additional metadata properties.
   */
  [key: string]: unknown
}

/**
 * Describes an HTML tag along with its attributes, children, and injection
 * location.
 */
export interface HtmlTagDescriptor {
  /**
   * The tag name.
   */
  tag: string

  /**
   * Optional attributes for the tag.
   */
  attrs?: Record<string, string | boolean | undefined>

  /**
   * Optional children of the tag, either as a string or an array of `HtmlTagDescriptor`.
   */
  children?: string | HtmlTagDescriptor[]

  /**
   * Specifies where the tag should be injected in the HTML document.
   *
   * @default 'head-prepend'
   */
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
}

/**
 * Represents a heading within content.
 */
export interface Heading {
  /**
   * The level of the heading.
   */
  level: number

  /**
   * The text content of the heading.
   */
  text: string

  /**
   * The unique ID generated for the heading.
   */
  id: string
}

/**
 * Represents a data store.
 */
export type Store<V> = { [key: string]: V }

// Re-exporting types from 'headless-route'
export type { BaseRoute, DynamicRoute, Route } from 'headless-route'
