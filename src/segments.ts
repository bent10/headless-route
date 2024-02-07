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
    isNonPartialDynamicRouteSegment(segment) ||
    isPartialDynamicRouteSegment(segment)
  )
}

/**
 * Checks if a segment of a route path is a non-partial dynamic segment.
 * Non-partial dynamic segments are indicated by a leading colon (`:`) or dollar
 * sign (`$`) and not ending with a question mark (`?`).
 *
 * @param segment The segment of the route path to check.
 * @returns `true` if the segment is a non-partial dynamic segment, `false` otherwise.
 */
function isNonPartialDynamicRouteSegment(segment: string) {
  return (
    (segment.startsWith(':') || segment.startsWith('$')) &&
    !segment.endsWith('?')
  )
}

/**
 * Checks if a segment of a route path is a partial dynamic segment. Partial
 * dynamic segments are indicated by a leading colon (`:`) or dollar sign (`$`)
 * and ending with a question mark (`?`), or enclosed in square brackets
 * (`[]`).
 *
 * @param segment The segment of the route path to check.
 * @returns `true` if the segment is a partial dynamic segment, `false` otherwise.
 */
function isPartialDynamicRouteSegment(segment: string) {
  return (
    (segment.startsWith('[') && segment.endsWith(']')) ||
    ((segment.startsWith(':') || segment.startsWith('$')) &&
      segment.endsWith('?'))
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
  const normalizedRoutePath = routePath.startsWith('/')
    ? routePath.slice(1)
    : routePath

  return normalizedRoutePath.split('/').map(segment => {
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
  const validSegment = segment.replace(/^\d+[\-\_]/, '')

  if (isNonPartialDynamicRouteSegment(validSegment)) {
    return `:${validSegment.slice(1)}`
  }

  if (isPartialDynamicRouteSegment(validSegment)) {
    return `:${validSegment.slice(1, -1)}?`
  }

  // handle unknown splats segment
  if (validSegment === '*') {
    return ':splats*'
  }

  return validSegment
}
