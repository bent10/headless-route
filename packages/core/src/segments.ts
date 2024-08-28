import { extname } from 'node:path'

/**
 * Extracts segments from a route ID relative to a `root` directory.
 *
 * @param id The route ID.
 * @param root The root directory of the routes.
 * @returns An array of segments representing the path of the route relative to the root directory.
 */
export function routeSegments(id: string, root = '') {
  const routePath = id
    .replace(new RegExp(`^${escapeRegExp(root)}`), '')
    .replace(new RegExp(`${escapeRegExp(extname(id))}$`), '')

  return parseRoutePath(routePath)
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
 * Checks if a segment of a route path is a dynamic segment. Dynamic
 * segments are typically indicated by a leading colon (`:`), dollar sign (`$`),
 * or enclosed in square brackets (`[]`).
 *
 * @param segment The segment of the route path to check.
 * @returns `true` if the segment is a dynamic segment, `false` otherwise.
 */
export function isDynamicRouteSegment(segment: string) {
  return (
    isWildcard(segment) ||
    isNonPartialDynamicRouteSegment(segment) ||
    isPartialDynamicRouteSegment(segment)
  )
}

/**
 * Determines if a route path segment is a wildcard segment. Wildcard
 * segments are represented by `*` or end with `.*`.
 *
 * @param segment - The route path segment to check.
 * @returns `true` if the segment is a wildcard segment,
 *   `false` otherwise.
 */
function isWildcard(segment: string): boolean {
  return segment === '*' || segment.endsWith('.*')
}

/**
 * Determines if a route path segment is a non-partial dynamic segment.
 * Non-partial dynamic segments start with `:` or `$` and do not end with
 * `?`, `*`, or `+`.
 *
 * @param segment The route path segment to check.
 * @returns `true` if it's a non-partial dynamic segment,
 *   otherwise `false`.
 */
function isNonPartialDynamicRouteSegment(segment: string) {
  return (
    (segment.startsWith(':') || segment.startsWith('$')) &&
    !/[?*+]$/.test(segment)
  )
}

/**
 * Determines if a route path segment is a partial dynamic segment. Partial
 * dynamic segments are enclosed in `[]`, or start with `:`, `$` and end
 * with `?`, `*`, or `+`.
 *
 * @param segment The route path segment to examine.
 * @returns `true` if it's a partial dynamic segment, otherwise `false`.
 */
function isPartialDynamicRouteSegment(segment: string) {
  return (
    (segment.startsWith('[') && segment.endsWith(']')) ||
    ((segment.startsWith(':') || segment.startsWith('$')) &&
      /[?*+]$/.test(segment))
  )
}

/**
 * Parses a route path into an array of normalized segments. The route path
 * is split by slashes (`/`), each segment is validated and normalized.
 *
 * @param routePath The route path to parse.
 * @returns An array of normalized segments.
 */
export function parseRoutePath(routePath: string) {
  return routePath
    .split('/')
    .filter(Boolean)
    .map(segment => {
      const validSegment = getValidSegment(segment)

      return normalizeSegment(validSegment)
    })
}

/**
 * Normalizes a route segment by decoding URI, replacing repeated slashes,
 * and normalizing Unicode characters (if supported).
 *
 * @param segment The segment of the route path to normalize.
 * @returns The normalized segment.
 */
export function normalizeSegment(segment: string) {
  return (
    decodeURI(segment)
      // Replaces repeated slashes in the URL.
      .replace(/\/+/g, '/')
      // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
      // Note: Missing native IE support, may want to skip this step.
      .normalize()
  )
}

/**
 * Gets the valid segment for a route path. If the segment is a non-partial
 * dynamic segment, it returns a normalized colon-prefixed segment. If the
 * segment is a partial dynamic segment, it returns a normalized colon-prefixed
 * segment followed by a question mark. Otherwise, it returns the normalized
 * segment.
 *
 * @param segment The segment of the route path to validate.
 * @returns The valid segment.
 */
function getValidSegment(segment: string) {
  // segment may include file names ordered numerically (e.g., 01-foo, 02-bar, etc.),
  // used for organizing routes in a specific order.
  const validSegment = segment.replace(/^\d+[-_]/, '')

  if (isNonPartialDynamicRouteSegment(validSegment)) {
    return `:${validSegment.slice(1)}`
  }

  if (isPartialDynamicRouteSegment(validSegment)) {
    const mod = /[*+]$/.test(validSegment) ? validSegment.slice(-1) : '?'
    return `:${validSegment.slice(1, -1)}${mod}`
  }

  // handle unknown splats segment
  // if (validSegment === '*') {
  //   return ':splats*'
  // }

  return validSegment
}
