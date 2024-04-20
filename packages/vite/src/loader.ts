import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'
import { Api } from './Api.js'
import { devCache } from './Cache.js'
import type { HeadlessRouteOptions } from './types.js'
import { toRelativePath } from './utils.js'

const PLUGIN_NAME = 'plugin-headless-route'

export function headlessRoute(options?: HeadlessRouteOptions): Plugin<Api> {
  const api = new Api(options)
  const input: string[] = [],
    inputMap: Record<string, { namespace: string; id: string }> = {}

  return {
    name: PLUGIN_NAME,
    api,
    async config() {
      return {
        appType: 'mpa',
        build: { rollupOptions: { input: [] } },
        optimizeDeps: { include: [] }
      }
    },
    async configResolved({ root, base, build }) {
      const relativeRoot = toRelativePath(root)

      // tweaks data config to fit with Vite configuration
      api.routesConfig.urlPrefix = base
      api.routesConfig.dir = toRelativePath(
        join(relativeRoot, api.routesConfig.dir)
      )
      api.data.config.dir = toRelativePath(
        join(api.routesConfig.dir, '../', api.data.config.dir)
      )
      api.data.config.localDataDir = api.routesConfig.dir
      api.currentHtmlTagDescriptor = []

      // init api
      await api.init()
      // exposes built-in data as 'env' object to the runtime
      api.data.set(
        `${api.data.config.dir}/env${api.data.config.extensions[0]}`,
        {
          root: relativeRoot,
          routesDir: api.routesConfig.dir,
          base,
          public: base + build.assetsDir
        }
      )

      // sets input and inputMap for build purpose
      api.routes.forEach(route => {
        input.push(route.url)
        inputMap[route.url] = {
          namespace: relativeRoot + route.url,
          id: route.id
        }
      })

      build.rollupOptions.input = input
    },
    resolveId(url) {
      if (input.includes(url)) {
        const { namespace, id } = inputMap[url]
        api.resolvedRouteIds[namespace] = { id, url }

        return namespace
      }
    },
    async load(resolveId) {
      if (api.resolvedRouteIds[resolveId]) {
        const route = api.getRoute(api.resolvedRouteIds[resolveId].url)!

        if (route?.context?.matter?.htmlTagsDescriptor)
          api.currentHtmlTagDescriptor =
            route?.context?.matter?.htmlTagsDescriptor

        return {
          code: await readFile(route.id, 'utf8'),
          map: null,
          moduleSideEffects: false,
          meta: { isHeadlessRoute: true, route }
        }
      }
    },
    transformIndexHtml(html) {
      return {
        html,
        tags: api.currentHtmlTagDescriptor
      }
    },
    async handleHotUpdate({ file, server }) {
      const id = toRelativePath(file)

      if (api.isWatchable(id)) {
        if (api.data.isDataSource(id)) {
          const newData = await api.data.load(id)
          api.data.set(id, newData)
        } else {
          const route = api.createRoute(id)
          api.setRoute(route)
        }

        return server.hot.send({ type: 'full-reload', path: '*' })
      }

      if (dirname(id).endsWith('layouts') && api.isMarkupRoute(id)) {
        // force re-render for all routes
        devCache.flush()

        return server.hot.send({ type: 'full-reload', path: '*' })
      }
    }
  }
}

export function useApi(plugins: Readonly<Plugin[]>) {
  const parentPlugin = plugins.find(plugin => plugin.name === PLUGIN_NAME)

  if (!parentPlugin) {
    throw new Error(`This plugin depends on the "${PLUGIN_NAME}" plugin.`)
  }

  return parentPlugin.api as Api
}
