import { readGitignore } from 'gitignore-reader'
import _ignore, { type Ignore, type Options as IgOptions } from 'ignore'
import setValue from 'set-value'
import type { Params, Route, RouteNotation, UnknownData } from './types.js'

type IgnoreFn = (options?: IgOptions) => Ignore

const ignore = (_ignore as unknown as IgnoreFn)().add(readGitignore())

/**
 * Checks if a given path is ignored according to the rules specified in the
 * project's `.gitignore` file.
 *
 * @param id The id to check for ignoring.
 * @returns A boolean indicating whether the id is ignored.
 */
export function isIgnored(id: string) {
  return ignore.ignores(id)
}

/**
 * Escapes special characters in a string to be used as a regular expression
 * pattern.
 *
 * @param str - The input string or value to escape.
 * @returns The escaped string with special characters replaced by their escaped
 *   counterparts.
 */
export function escapeRegExp(str: string) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Checks if the provided file extension is allowed based on the allowed extensions array.
 * @param extensions - An array of allowed file extensions.
 * @param fileExtension - The file extension to check.
 * @returns True if the file extension is allowed, otherwise false.
 */
export function isValidExtension(extensions: string[], fileExtension: string) {
  return extensions.includes(fileExtension) || extensions.includes('*')
}

export function createDynamicRouteParams(segments: string[]) {
  let pattern = ''
  return segments.reduce((params, segment) => {
    const paramId = getParamId(segment)
    const partial = isPartialDynamicRouteSegment(segment)

    pattern += `/${segment.replace(paramId, '*')}`

    params[paramId] = { pattern, partial }

    return params
  }, {} as Params)
}

/**
 * Checks if a segment of a route path is a dynamic segment. Dynamic
 * segments are typically indicated by a leading colon (`:`) or dollar sign
 * (`$`).
 *
 * @param segment The segment of the route path to check.
 * @returns `true` if the segment is a dynamic segment, `false` otherwise.
 */
export function isDynamicRouteSegment(segment: string) {
  return (
    isNonPartialDynamicRouteSegment(segment) ||
    isPartialDynamicRouteSegment(segment)
  )
}

function isNonPartialDynamicRouteSegment(segment: string) {
  return (
    (segment.startsWith(':') || segment.startsWith('$')) &&
    !segment.endsWith('?')
  )
}

function isPartialDynamicRouteSegment(segment: string) {
  return (
    (segment.startsWith('[') && segment.endsWith(']')) ||
    ((segment.startsWith(':') || segment.startsWith('$')) &&
      segment.endsWith('?'))
  )
}

function getParamId(segment: string) {
  if (isNonPartialDynamicRouteSegment(segment)) {
    return segment.slice(1)
  }

  if (isPartialDynamicRouteSegment(segment)) {
    return segment.slice(1, -1)
  }

  return segment
}

/**
 * Creates nested object notation of routes.
 *
 * @param routes - An array of routes.
 * @returns Object notation representing the routes.
 */
export function createRouteNotation<Context extends UnknownData = UnknownData>(
  routes: Route<Context>[]
) {
  const notation: RouteNotation<Context> = {}

  for (const route of routes) {
    setValue(notation, route.stem, route, {
      separator: '/'
    })
  }

  return notation
}
