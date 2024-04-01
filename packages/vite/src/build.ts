import type { Plugin } from 'vite'
import { Api } from './Api.js'
import { runHandler } from './handler.js'
import { useApi } from './loader.js'
import type { HeadlessRouteContextMeta } from './types.js'

/**
 * A Vite plugin for building headless routes.
 *
 * This plugin integrates with the `Api` class to handle route transformation
 * during the build process.
 */
export default function build(): Plugin {
  let api: Api | undefined

  return {
    name: 'plugin-headless-route:build',
    buildStart({ plugins }) {
      if (plugins) {
        api = useApi(plugins)
      }
    },
    async transform(content, id) {
      if (api?.resolvedRouteIds[id]) {
        const { route } = this.getModuleInfo(id)!
          .meta as HeadlessRouteContextMeta

        // incorporating data, helpers, and other route-specific information
        api.createRouteContext(route)

        // sets route content
        if (api.isMarkupRoute(route.id)) {
          content = api.parseMetadata(route, content)
        }

        return await runHandler.call(api, route, content)
      }
    }
  }
}
