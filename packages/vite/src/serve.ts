import { readFile } from 'node:fs/promises'
import type { Plugin } from 'vite'
import Youch from 'youch'
import { Api } from './Api.js'
import { devCache } from './Cache.js'
import { HttpError } from './Error.js'
import { runHandler } from './handler.js'
import { useApi } from './loader.js'
import { toRelativePath } from './utils.js'

/**
 * A Vite plugin for serving headless routes during development.
 *
 * This plugin integrates with the `Api` class to handle route serving and
 * reloading.
 */
export default function serve(): Plugin {
  let api: Api

  return {
    name: 'plugin-headless-route:serve',
    configureServer(server) {
      api = useApi(server.config.plugins)

      server.watcher.on('all', async (eventName, file) => {
        const id = toRelativePath(file)

        if (!api.isWatchable(id) || !['add', 'unlink'].includes(eventName))
          return

        switch (eventName) {
          case 'add':
            if (api.data.isDataSource(id)) {
              const newData = await api.data.load(id)
              api.data.set(id, newData)
            } else {
              const route = api.createRoute(id)
              api.setRoute(route)
            }
            server.watcher.add(file)
            break

          case 'unlink':
            if (api.data.isDataSource(id)) {
              api.data.delete(id)
            } else {
              const route = api.createRoute(id)
              api.deleteRoute(route)
            }
            server.watcher.unwatch(file)
            break
        }

        // force re-render for all routes
        devCache.flush()
        server.hot.send({ type: 'full-reload', path: '*' })
      })

      return () => {
        server.middlewares.use(async (req, res) => {
          try {
            // @todo - This task should be accomplished utilizing dynamic
            //   routes for increased flexibility and efficiency
            if (req.url === '/__routes') {
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify(api.routes, null, 2))
            } else if (req.url === '/__data') {
              res.setHeader('Content-Type', 'application/json')
              return res.end(api.data.dump())
            }

            if (req.headers['sec-fetch-dest'] === 'document') {
              let route = api.getRoute(req.url!)
              let statusCode = 200

              // @todo add option to handle error 404
              if (!route) {
                statusCode = 404
                route = api.fallbackRoute

                if (!route) {
                  statusCode = 500
                  throw new HttpError(statusCode, 'Fallback page not found!')
                }
              }

              // incorporating data, helpers, and other route-specific information
              api.createRouteContext(route)

              const isMarkupRoute = api.isMarkupRoute(route.id)
              // loads route content
              const content = isMarkupRoute
                ? api.parseMetadata(route)
                : await readFile(route.id, 'utf8')
              // handles loaded route content
              const handledContent = await runHandler.call(api, route, content)

              res.statusCode = statusCode
              return res.end(
                await server.transformIndexHtml(route.url, handledContent)
              )
            }
          } catch (err) {
            const error = err as Error

            const youch = new Youch(error, req)
            const html = await youch.toHTML()

            res.end(html)
          }
        })
      }
    }
  }
}
