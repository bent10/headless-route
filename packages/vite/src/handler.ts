import type { Api } from './Api.js'
import type { RouteHandlerFn, RouteWithContext } from './types.js'

/**
 * Runs the appropriate handler for the given route and content.
 *
 * @param route - The route context.
 * @param content - The content to be handled.
 * @returns The handled content, or the original content if no handler is
 *   found.
 */
export async function runHandler(
  this: Api | undefined,
  route: RouteWithContext,
  content: string
) {
  if (!this?.handler) return content

  // The most recently defined handler will take precedence!
  const handlerQueue = Object.entries(this.handler).reverse()

  for (const [name, handlerOrTuple] of handlerQueue) {
    const normalizedName = normalizeHandlerName(name)

    if (route.id.endsWith(normalizedName)) {
      if (typeof handlerOrTuple === 'function') {
        return await handlerOrTuple.call(route, content, this.routesConfig.dir)
      }

      // if tuple, runs handler sequentially
      if (Array.isArray(handlerOrTuple)) {
        return await runTupleHandler.call(this, content, handlerOrTuple)
      }
    }
  }

  return content

  async function runTupleHandler(
    this: Api,
    content: string,
    handler: Array<RouteHandlerFn | string>
  ): Promise<string> {
    return await handler.reduce(async (prevContent, currHandler) => {
      if (typeof currHandler === 'function') {
        return await currHandler.call(
          route,
          await prevContent,
          this.routesConfig.dir
        )
      } else if (typeof currHandler === 'string') {
        const handlerAlias = this.handler?.[currHandler]

        if (typeof handlerAlias === 'function') {
          return await handlerAlias.call(
            route,
            await prevContent,
            this.routesConfig.dir
          )
        }

        // if tuple, runs handler sequentially
        if (Array.isArray(handlerAlias)) {
          return await runTupleHandler.call(
            this,
            await prevContent,
            handlerAlias
          )
        }
      }

      return prevContent
    }, Promise.resolve(content))
  }
}

function normalizeHandlerName(name: string) {
  return name.startsWith('.') ? name : `.${name}`
}
